import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
dotenv.config();
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Serverless-safe environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic route imports (Vercel-compatible)
// Import Routes
import Home_route from "./Routes/Home_route.js";
import Contact_route from "./Routes/Contact_route.js";
import About_route from "./Routes/About_route.js";
import Guidelines_route from "./Routes/Guidelines_route.js";
import Choose_route from "./Routes/Choose_route.js";
import Diet_route from "./Routes/Diet_route.js";
import Drain_Care_route from "./Routes/Drain_Care_route.js";
import Finance_route from "./Routes/Finance_route.js";
import Meet_Our_Patients_route from "./Routes/Meet_Our_Patients_route.js";
import Policies_route from "./Routes/Policies_route.js";
import Questions_And_Answer_route from "./Routes/Questions_And_Answer_route.js";
import Blog_route from "./Routes/Blog_route.js";
import Read_More_route from "./Routes/Read_More_route.js";
import Photo_Gallary_route from "./Routes/Photo_Gallary_route.js";
import Out_of_town_route from "./Routes/Out_of_town_route.js";


const app = express();

// Serverless-optimized middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Enhanced Handlebars configuration
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

// Serverless-safe partial handling
Handlebars.registerHelper('partial', function(name) {
  try {
    if (Handlebars.partials[name]) {
      return new Handlebars.SafeString(Handlebars.partials[name]);
    }
    console.warn(`Partial "${name}" missing - rendering fallback`);
    return new Handlebars.SafeString(`
      <div class="alert alert-warning my-4" data-partial-fallback="${name}">
        <h3>${name.replace(/([A-Z])/g, ' $1')}</h3>
        <p>Content coming soon! Check back later.</p>
      </div>
    `);
  } catch (error) {
    console.error(`Partial error: ${error.message}`);
    return new Handlebars.SafeString('');
  }
});

// Static assets configuration
const staticConfig = {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) res.set('Content-Type', 'text/css');
  }
};

app.use(express.static(join(__dirname, 'Templates'), staticConfig));
app.use(express.static(join(__dirname, 'Upload'), staticConfig));
app.use(express.static(join(__dirname, 'Qapartials'), staticConfig));

// Dynamic route loading
Object.entries(routeImports).forEach(async ([routeName, path]) => {
  try {
    const { default: router } = await import(path);
    app.use(`/${routeName.replace('_route', '')}`, router);
  } catch (error) {
    console.error(`Failed to load route ${routeName}:`, error);
    process.exit(1);
  }
});

// Database connection with serverless optimizations
const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  bufferCommands: false
};

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.mongooconectionurl, dbConfig);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Serverless startup sequence
const startServer = async () => {
  await connectDatabase();
  const port = process.env.port || 3000;
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Registered partials:', Object.keys(Handlebars.partials));
  });
};

// Vercel serverless compatibility
const server = startServer();
export default server;
