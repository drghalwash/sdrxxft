// --------------------------------------------------------------------------------
// IMPORT CORE DEPENDENCIES
// --------------------------------------------------------------------------------
import express from 'express';                         // Express framework
import { engine } from 'express-handlebars';             // Handlebars integration
import Handlebars from 'handlebars';                     // Main Handlebars library
import dotenv from 'dotenv';                             // Loads environment variables
dotenv.config();                                        // Initialize dotenv for .env
import methodOverride from 'method-override';            // Support for PUT/DELETE verbs
import mongoose from 'mongoose';                         // MongoDB ODM

// --------------------------------------------------------------------------------
// IMPORT ROUTE FILES
// --------------------------------------------------------------------------------
// Make sure these file names and locations match your repository structure.
import Home_route from './Routes/Home_route.js';
import Contact_route from './Routes/Contact_route.js';
import About_route from './Routes/About_route.js';
import Guidelines_route from './Routes/Guidelines_route.js';
import Choose_route from './Routes/Choose_route.js';
import Diet_route from './Routes/Diet_route.js';
import Drain_Care_route from './Routes/Drain_Care_route.js';
import Finance_route from './Routes/Finance_route.js';
import Meet_Our_Patients_route from './Routes/Meet_Our_Patients_route.js';
import Policies_route from './Routes/Policies_route.js';
import Questions_And_Answer_route from './Routes/Questions_And_Answer_route.js';
import Blog_route from './Routes/Blog_route.js';
import Read_More_route from './Routes/Read_More_route.js';
import Photo_Gallary_route from './Routes/Photo_Gallary_route.js';
import Out_of_town_route from './Routes/Out_of_town_route.js';

// --------------------------------------------------------------------------------
// POLYFILL FOR __dirname (for ES modules)
// --------------------------------------------------------------------------------
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------------------------------------------------------------
// INITIALIZE THE EXPRESS APPLICATION & MIDDLEWARE
// --------------------------------------------------------------------------------
const app = express();

// Parse URL-encoded bodies from HTML forms
app.use(express.urlencoded({ extended: true }));

// Override HTTP methods (e.g., support for PUT/DELETE via ?_method=DELETE)
app.use(methodOverride('_method'));

// Optionally, add JSON parsing if needed:
// app.use(express.json());

// File: /server.js (add near other route imports)
import categoriesApi from './Routes/api/categories.js';

// Add this after other app.use() calls
app.use('/api/categories', categoriesApi);

// --------------------------------------------------------------------------------
// CONFIGURE THE HANDLEBARS VIEW ENGINE
// --------------------------------------------------------------------------------
app.engine(
  'handlebars',
  engine({
    // Add partials directories (update array if you add more folders)
    partialsDir: [
      join(__dirname, 'Qapartials'),
      join(__dirname, 'Templates', 'partials')
    ],
    extname: '.handlebars',
    defaultLayout: 'main', // Default layout located in /Templates/layouts/main.handlebars
    layoutsDir: join(__dirname, 'Templates', 'layouts'),
    helpers: {
      // Sample helper; expand as needed.
      add: (a, b) => a + b,
    }
  })
);
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'Templates'));

// Register global Handlebars helpers (for extra safety)
Handlebars.registerHelper('add', (a, b) => a + b);
Handlebars.registerHelper('partial', function (name) {
  if (Handlebars.partials[name]) {
    return new Handlebars.SafeString(Handlebars.partials[name]);
  } else {
    console.warn(`Partial ${name} not found`);
    return '';
  }
});

// --------------------------------------------------------------------------------
// SERVE STATIC FILES
// --------------------------------------------------------------------------------
// Static folders for CSS, JS, images, etc.
app.use(express.static(join(__dirname, 'Templates')));
app.use(express.static(join(__dirname, 'Upload')));
app.use(express.static(join(__dirname, 'Qapartials')));

// --------------------------------------------------------------------------------
// MOUNT APPLICATION ROUTES
// --------------------------------------------------------------------------------
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

// NOTE: The Questions_And_Answer_route now contains its own inline logic (centralized config for categories and partials)
// instead of delegating to an external controller (i.e. no separate "index" function).
app.use('/Questions_And_Answer', Questions_And_Answer_route);

app.use('/Blog', Blog_route);
app.use('/Read_More', Read_More_route);
app.use('/Photo_Gallary', Photo_Gallary_route);
app.use('/Out_of_town', Out_of_town_route);

// --------------------------------------------------------------------------------
// CUSTOM ERROR ROUTE FOR NON-EXISTENT PARTIALS 
// --------------------------------------------------------------------------------
app.use('/Qapartials/*', (req, res, next) => {
  console.error('Partial not found: ' + req.url);
  res.status(404).send('Partial not found');
});

// --------------------------------------------------------------------------------
// GLOBAL ERROR HANDLING MIDDLEWARE
// --------------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  // Renders a custom error view (create /Templates/error.handlebars)
  res.status(500).render('error', { error: err });
});

// --------------------------------------------------------------------------------
// DATABASE CONNECTION SETUP (Mongoose)
// --------------------------------------------------------------------------------
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.mongooconectionurl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000, // 60 seconds for initial connection
      socketTimeoutMS: 120000, // 120 seconds for socket timeout
      bufferCommands: true     // Buffer commands until connection is ready
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Respond with a custom error page on all routes if DB connection fails.
    app.use((req, res) => {
      res.status(500).render('Dashboard/404', { error });
    });
  }
}

// --------------------------------------------------------------------------------
// START THE SERVER (AFTER SUCCESSFUL DATABASE CONNECTION)
// --------------------------------------------------------------------------------
connectToDatabase()
  .then(() => {
    const PORT = process.env.port || 3000;
    app.listen(PORT, () => {
      console.log(`Started the application on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start the application:', error);
    app.use((req, res) => {
      res.status(500).render('Dashboard/404', { error });
    });
  });
