import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
dotenv.config();
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Determine __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// ========= Middleware Setup =========
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ========= Handlebars Engine Configuration =========
app.engine('handlebars', engine({
  partialsDir: [
    join(__dirname, 'Qapartials'),
    join(__dirname, 'Templates', 'partials')
  ],
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: join(__dirname, 'Templates', 'layouts'),
  helpers: {
    add: (a, b) => a + b,
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'Templates'));

// ========= Register Handlebars Helpers =========
// Standard helper
Handlebars.registerHelper('add', (a, b) => a + b);

// Enhanced Partial Helper
// This helper avoids filesystem calls (which can be problematic in serverless)
// and relies on registered partials. If a partial is missing,
// it renders a styled fallback message.
Handlebars.registerHelper('partial', function(name) {
  if (Handlebars.partials && Handlebars.partials[name]) {
    return new Handlebars.SafeString(Handlebars.partials[name]);
  } else {
    console.warn(`Partial "${name}" not found. Rendering fallback content.`);
    return new Handlebars.SafeString(`
      <div class="alert alert-warning mt-3" data-missing-partial="${name}">
        <h3>${name}</h3>
        <p>Content coming soon! Please check back later.</p>
      </div>
    `);
  }
});

// ========= Serve Static Files =========
// Make sure your static assets (Templates, Upload, Qapartials) are correctly deployed.
app.use(express.static(join(__dirname, 'Templates')));
app.use(express.static(join(__dirname, 'Upload')));
app.use(express.static(join(__dirname, 'Qapartials')));

// ========= Mount Routes =========
app.use('/', Home_route);
app.use('/Home', Home_route);
app.use('/Contact', Contact_route);
app.use('/About_Us', About_route);
app.use('/Guidelines', Guidelines_route);
app.use('/Choose', Choose_route);
app.use('/Diet', Diet_route);
app.use('/Drain_Care', Drain_Care_route);
app.use('/Finance', Finance_route);
app.use('/Meet_Our_Patients', Meet_Our_Patients_route);
app.use('/Policies', Policies_route);
app.use('/Questions_And_Answer', Questions_And_Answer_route);
app.use('/Blog', Blog_route);
app.use('/Read_More', Read_More_route);
app.use('/Photo_Gallary', Photo_Gallary_route);
app.use('/Out_of_town', Out_of_town_route);

// ========= Specific Error Handler for Missing Partials =========
app.use('/Qapartials/*', (req, res) => {
  console.error('Static partial not found:', req.url);
  res.status(404).send('Partial not found');
});

// ========= Global Error Handler =========
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).render('error', { error: err });
});

// ========= MongoDB Connection Setup =========
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.mongooconectionurl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      bufferCommands: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // In a serverless environment, force exit on critical DB connection failure.
    process.exit(1);
  }
}

// ========= Start Server =========
connectToDatabase().then(() => {
  const port = process.env.port || 3000;
  app.listen(port, () => {
    console.log(`Application started on http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
