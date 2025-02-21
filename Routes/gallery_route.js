// Import Router from Express
import { Router } from 'express';

// Import the controller functions
import { index, publicImages, privateImages } from '../Controller/gallery.js';

// Create a new router instance
const router = new Router();

// Route: Fetch gallery by Slug
router.get('/:slug', (req, res, next) => {
  console.log('[Route] GET /:slug - Fetch gallery by slug');
  console.log('  - Change: Route parameter changed from id to slug');
  next(); // Pass control to the `index` controller
}, index);

// Route: Fetch public images by ID
router.get('/public_images/:id', (req, res, next) => {
  console.log('[Route] GET /public_images/:id - Fetch public images by ID');
  console.log('  - Change: Fixed route name and parameter for public images');
  next(); // Pass control to the `publicImages` controller
}, publicImages);

// Route: Fetch private images (POST)
router.post('/private_images', (req, res, next) => {
  console.log('[Route] POST /private_images - Fetch private images');
  console.log('  - Change: Fixed route name for private images');
  next(); // Pass control to the `privateImages` controller
}, privateImages);

// Export the router for use in the application
export default router;
