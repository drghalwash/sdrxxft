import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
dotenv.config();
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Serverless-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic route imports for serverless compatibility
const importRoute = async (routePath) => {
  try {
    const module = await import(`./Routes/${routePath}.js`);
    return module.default;
  } catch (error) {
    console.error(`Route import failed: ${routePath}`, error);
    process.exit(1);
  }
};

const app = express();

// Middleware Configuration
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Handlebars Configuration for Serverless
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

// Serverless-Optimized Partial Handling
Handlebars.registerHelper('partial', function(name) {
  try {
    if (Handlebars.partials[name]) {
      return new Handlebars.SafeString(Handlebars.partials[name]);
    }
    console.warn(`Partial "${name}" not found. Rendering fallback.`);
    return new Handlebars.SafeString(`
      <div class="alert alert-warning mt-3" data-partial-fallback="${name}">
        <h3>${name.replace(/([A-Z])/g, ' $1')}</h3>
        <p>Content coming soon! Check back later.</p>
      </div>
    `);
  } catch (error) {
    console.error(`Partial error: ${error.message}`);
    return new Handlebars.SafeString('');
  }
});

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

// Route Loading
const routeConfig = [
  { path: '/', route: 'Home_route' },
  { path: '/Questions_And_Answer', route: 'Questions_And_Answer_route' },
  // ... other routes ...
];

(async () => {
  for (const { path, route } of routeConfig) {
    try {
      const routeHandler = await importRoute(route);
      app.use(path, routeHandler);
    } catch (error) {
      console.error(`Failed to mount route: ${route}`, error);
    }
  }
})();

// MongoDB Connection for Serverless
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  bufferCommands: false
};

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.mongooconectionurl, mongoConfig);
    console.log('MongoDB connected successfully');
    
    // Verify partial registration
    console.log('Registered Partials:', Object.keys(Handlebars.partials));
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).render('error', {
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Serverless Startup Sequence
const startServer = async () => {
  await connectDatabase();
  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

// Vercel Serverless Compatibility
const server = startServer();
export default server;
