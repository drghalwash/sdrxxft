// --------------------------------------------------------------------------------
// Paste the following code into /server.js (located at the root directory, alongside package.json)
// --------------------------------------------------------------------------------

// Import core dependencies
import express from 'express';                     // Express framework for our server
import { engine } from 'express-handlebars';         // Handlebars templating engine integration
import Handlebars from 'handlebars';                 // Main Handlebars library
import dotenv from 'dotenv';                         // Environment variable loader
dotenv.config();                                   // Initialize dotenv to load .env file variables
import methodOverride from 'method-override';        // HTTP verb override middleware
import mongoose from 'mongoose';                     // MongoDB ODM

// Import route files (ensure that the folder names and file names match your repository)
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

// Polyfill __dirname for ES modules using fileURLToPath and dirname
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------------------------------------------------------------
// Initialize the Express application and middleware
// --------------------------------------------------------------------------------
const app = express();

// Parse URL-encoded data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Support for HTTP verbs such as PUT or DELETE via query parameter ?_method=DELETE
app.use(methodOverride('_method'));

// --------------------------------------------------------------------------------
// Configure Handlebars view engine
// --------------------------------------------------------------------------------
app.engine('handlebars', engine({
  // When adding new partial folders, only update the partialsDir array here.
  partialsDir: [
    join(__dirname, 'Qapartials'),
    join(__dirname, 'Templates', 'partials')
  ],
  extname: '.handlebars',
  defaultLayout: 'main', // The default layout file is at /Templates/layouts/main.handlebars
  layoutsDir: join(__dirname, 'Templates', 'layouts'),
  helpers: {
    // Example helper that adds two numbers; you can expand this as needed.
    add: (a, b) => a + b,
  }
}));
app.set('view engine', 'handlebars');

// Set the views directory for the templates
const viewsPath = join(__dirname, 'Templates');
app.set('views', viewsPath);

// Register global Handlebars helpers
Handlebars.registerHelper('add', (a, b) => a + b);
Handlebars.registerHelper('partial', function(name) {
  // Helper to ensure partials are safely rendered; logs a warning if missing.
  if (Handlebars.partials[name]) {
    return new Handlebars.SafeString(Handlebars.partials[name]);
  } else {
    console.warn(`Partial ${name} not found`);
    return '';
  }
});

// --------------------------------------------------------------------------------
// Serve static files
// If you add new static folders (like for CSS/JS/images), update here accordingly.
// --------------------------------------------------------------------------------
app.use(express.static(join(__dirname, 'Templates')));
app.use(express.static(join(__dirname, 'Upload')));
app.use(express.static(join(__dirname, 'Qapartials')));

// --------------------------------------------------------------------------------
// Mount application routes
// Centralized routing keeps the code DRY and maintainable.
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

// --------------------------------------------------------------------------------
// Custom error handling for non-existent partials
// This catches requests to any URL under /Qapartials/ that don’t match a file.
app.use('/Qapartials/*', (req, res, next) => {
  console.error('Partial not found: ' + req.url);
  res.status(404).send('Partial not found');
});

// --------------------------------------------------------------------------------
// Global error handling middleware
// This middleware catches errors thrown in any route or middleware.
// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack); // Log detailed error information
  res.status(500).render('error', { error: err }); // Render a custom error page
});


// --------------------------------------------------------------------------------
// Connect to MongoDB using Mongoose with robust connection options
// --------------------------------------------------------------------------------
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.mongooconectionurl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000,    // 60 seconds timeout for initial connection
      socketTimeoutMS: 120000,    // 120 seconds for socket timeout
      bufferCommands: true        // Buffer Mongoose commands until connection is ready
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // If DB connection fails, respond with a custom error page on all routes.
    app.use((req, res) => {
      res.status(500).render('Dashboard/404', { error });
    });
  }
}

// --------------------------------------------------------------------------------
// Start the server after successful database connection
// --------------------------------------------------------------------------------
connectToDatabase().then(() => {
  // Use process.env.port from .env or default to port 3000
  const PORT = process.env.port || 3000;
  app.listen(PORT, () => {
    console.log(`Started the application on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start the application:', error);
  app.use((req, res) => {
    res.status(500).render('Dashboard/404', { error });
  });
});
