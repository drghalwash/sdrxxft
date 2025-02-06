// server.js
import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import fs from 'fs';

// Configuration Setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database Configuration
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  bufferCommands: true,
  bufferMaxEntries: 0
};

// Express Application Setup
const app = express();

// Middleware Configuration
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Handlebars Engine Configuration
app.engine('handlebars', engine({
  partialsDir: [
    join(__dirname, 'Qapartials'),
    join(__dirname, 'Templates', 'partials')
  ],
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: join(__dirname, 'Templates', 'layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));

app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'Templates'));

// Partial Handling with Serverless Optimization
const registerPartials = () => {
  const partialsDir = join(__dirname, 'Qapartials');
  fs.readdirSync(partialsDir).forEach(file => {
    const partialName = file.split('.')[0];
    const partialContent = fs.readFileSync(join(partialsDir, file), 'utf8');
    Handlebars.registerPartial(partialName, partialContent);
  });
};

// Custom Handlebars Helpers
Handlebars.registerHelper('renderCategory', function(categoryId, categoriesConfig) {
  const partialExists = Handlebars.partials[categoryId];
  return partialExists ?
    new Handlebars.SafeString(`{{> ${categoryId}}}`) :
    new Handlebars.SafeString(`
      <section class="category-placeholder" data-category="${categoryId}">
        <h2>${getCategoryName(categoryId, categoriesConfig)}</h2>
        <div class="content-coming-soon">
          <i class="fas fa-wrench"></i>
          <p>Content under development</p>
        </div>
      </section>
    `);
});

function getCategoryName(categoryId, categoriesConfig) {
  for (const group of Object.values(categoriesConfig.groups)) {
    const category = group.categories.find(cat => cat.id === categoryId);
    if (category) return category.name;
  }
  return categoryId.replace(/([A-Z])/g, ' $1');
}

// Static Assets Configuration
const staticConfig = {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) res.set('Content-Type', 'text/css');
  }
};

app.use(express.static(join(__dirname, 'Templates'), staticConfig));
app.use(express.static(join(__dirname, 'Upload'), staticConfig));
app.use(express.static(join(__dirname, 'Qapartials'), staticConfig));

// Route Imports (Static for Serverless Reliability)
import Home_route from "./Routes/Home_route.js"
import Contact_route from "./Routes/Contact_route.js"
import About_route from "./Routes/About_route.js"
import Guidelines_route from "./Routes/Guidelines_route.js"
import Choose_route from "./Routes/Choose_route.js"
import Diet_route from "./Routes/Diet_route.js"
import Drain_Care_route from "./Routes/Drain_Care_route.js"
import Finance_route from "./Routes/Finance_route.js"
import Meet_Our_Patients_route from "./Routes/Meet_Our_Patients_route.js"
import Policies_route from "./Routes/Policies_route.js"
import Questions_And_Answer_route from "./Routes/Questions_And_Answer_route.js"
import Blog_route from "./Routes/Blog_route.js"
import Read_More_route from "./Routes/Read_More_route.js"
import Photo_Gallary_route from "./Routes/Photo_Gallary_route.js"
import Out_of_town_route from "./Routes/Out_of_town_route.js"

// Route Configuration
app.use('/',Home_route);
app.use('/Home',Home_route);
app.use('/Contact',Contact_route);
app.use('/About_Us',About_route);
app.use('/Guidelines',Guidelines_route);
app.use('/Choose',Choose_route);
app.use('/Diet',Diet_route);
app.use('/Drain_Care',Drain_Care_route);
app.use('/Finance',Finance_route);
app.use('/Meet_Our_Patients',Meet_Our_Patients_route);
app.use('/Policies',Policies_route);
app.use('/Questions_And_Answer',Questions_And_Answer_route);
app.use('/Blog',Blog_route);
app.use('/Read_More',Read_More_route);
app.use('/Photo_Gallary',Photo_Gallary_route);
app.use('/Out_of_town',Out_of_town_route);


// Database Connection Manager
let isDatabaseConnected = false;

const connectDatabase = async () => {
  if (isDatabaseConnected) return;
  
  try {
    await mongoose.connect(process.env.mongooconectionurl, mongoConfig);
    isDatabaseConnected = true;
    console.log('MongoDB connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Application Error:', err.stack);
  res.status(500).render('error', {
    message: process.env.NODE_ENV === 'production' ?
      'Service temporarily unavailable' :
      err.message
  });
});

// Serverless Initialization Sequence
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;
  
  await connectDatabase();
  registerPartials();
  console.log('Registered Partials:', Object.keys(Handlebars.partials));
  
  isInitialized = true;
};

// Vercel Serverless Handler
let vercelHandler;

export default async (req, res) => {
  try {
    if (!vercelHandler) {
      await initializeApp();
      vercelHandler = app;
    }
    return vercelHandler(req, res);
  } catch (error) {
    console.error('Initialization failed:', error);
    return res.status(500).send('Server initialization failed');
  }
};
