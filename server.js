import  express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';

// Register a custom helper to check if a category has questions
Handlebars.registerHelper("hasQuestions", function (categories) {
  return categories.some(category => category.questions && category.questions.length > 0);
});

import dotenv from 'dotenv';
dotenv.config();
import methodOverride from 'method-override';

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
import gallery_route from "./Routes/gallery_route.js"
import Out_of_town_route from "./Routes/Out_of_town_route.js"


import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

// Configure Handlebars with partials directory
app.engine('handlebars', engine({
    // Use partialsDirs instead of partialsDir (partialsDir is deprecated)
    partialsDir: [
        join(__dirname, 'Qapartials'),
        join(__dirname, 'Templates', 'partials')
    ],
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, 'Templates', 'layouts'),
    helpers: {
        add: function(a, b) {
            return a + b;
        },
    }
}));


app.set('view engine', 'handlebars');
const viewsPath = join(__dirname, 'Templates');
app.set('views', viewsPath);
Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});
// Add error handling for missing partials
Handlebars.registerHelper('partial', function(name) {
    if (Handlebars.partials[name]) {
        return new Handlebars.SafeString(Handlebars.partials[name]);
    } else {
        console.warn(`Partial ${name} not found`);
        return '';
    }
});
// Serve static files
app.use(express.static(join(__dirname, 'Templates')));
app.use(express.static(join(__dirname, 'Upload')));
app.use(express.static(join(__dirname, 'Qapartials')));

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
app.use('/gallery',gallery_route);
app.use('/Out_of_town',Out_of_town_route);




// Error handlers
app.use('/Qapartials/*', (req, res, next) => {
    console.error('Partial not found:', req.url);  // Add logging
    res.status(404).send('Partial not found');
});

app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);  // Add detailed logging
    res.status(500).render('error', { error: err }); // Render error page instead of plain text
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to inject Supabase into requests (optional)
export const supabaseMiddleware = (req, res, next) => {
  req.supabase = supabase;
  next();
};

// Example: Log Supabase initialization status
console.log('[Supabase] Client initialized successfully');