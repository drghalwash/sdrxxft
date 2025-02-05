import  express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';

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
import Photo_Gallary_route from "./Routes/Photo_Gallary_route.js"
import Out_of_town_route from "./Routes/Out_of_town_route.js"

import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Configure Handlebars with partials directory
app.engine('handlebars', engine({
    // Define multiple partial directories
    partialsDir: [
        join(__dirname, 'qapartials'),
        join(__dirname, 'Templates', 'partials') // For other partials if needed
    ],
    // Optional: Configure helpers
    helpers: {
        add: function(a, b) {
            return a + b;
        }
    }
}));

app.set('view engine', 'handlebars');
const viewsPath = join(__dirname, 'Templates');
app.set('views', viewsPath);
Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});
// Serve static files
app.use(express.static(join(__dirname, 'Templates')));
app.use(express.static(join(__dirname, 'Upload')));
app.use('/qapartials', express.static(join(__dirname, 'qapartials')));

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


// Handle 404 errors for partial files
app.use('/qapartials/*', (req, res) => {
    res.status(404).send('Partial not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.mongooconectionurl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 60000, // 60 seconds
            socketTimeoutMS: 120000, // 120 seconds
            bufferCommands: true,   // Allow Mongoose to buffer commands until connection is established
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        app.use((req, res) => {
            res.status(500).render('Dashboard/404', { error });
        });
    }
}

// Connect to MongoDB, then start the server
connectToDatabase().then(() => {
    app.listen(process.env.port, () => {
        console.log('Started the application on http://localhost:' + process.env.port);
    });
}).catch(error => {
    console.error('Failed to start the application:', error);
    app.use((req, res) => {
        res.status(500).render('Dashboard/404', { error });
    });
});
