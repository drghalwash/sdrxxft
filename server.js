import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import dotenv from 'dotenv';
dotenv.config();
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Serverless-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic route imports (Vercel-friendly)
const importRoute = async (routePath) => {
  try {
    return await import(`./Routes/${routePath}`);
  } catch (error) {
    console.error(`Failed to import route: ${routePath}`, error);
    process.exit(1);
  }
};

const app = express();

// Serverless-optimized middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Handlebars configuration for serverless
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

// Serverless-safe static files
app.use(express.static(join(__dirname, 'Templates'), { maxAge: '1y' }));
app.use(express.static(join(__dirname, 'Upload'), { maxAge: '1y' }));
app.use(express.static(join(__dirname, 'Qapartials'), { maxAge: '1y' }));

// Enhanced partial handler for serverless environments
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

// Dynamic route mounting
const routes = [
  { path: '/', route: 'Home_route' },
  { path: '/Questions_And_Answer', route: 'Questions_And_Answer_route' },
  // ... other routes ...
];

for (const { path, route } of routes) {
  try {
    const routeModule = await importRoute(route);
    app.use(path, routeModule.default);
  } catch (error) {
    console.error(`Failed to mount route: ${route}`);
  }
}

// Serverless-optimized MongoDB connection
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.mongooconectionurl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Critical for serverless functions
  }
};

// Error handling optimized for serverless
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
    console.log(`Server ready on port ${port}`);
  });
};

// Vercel serverless compatibility
const server = startServer();
export default server;
