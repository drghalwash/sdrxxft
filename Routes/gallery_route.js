// Import Router from Express
import { Router } from 'express';

// Import the controller functions
import { index, publicImages, privateImages } from '../Controller/gallery.js';

// Create a new router instance
const router = new Router();

// Route: Fetch gallery by slug
router.get('/:slug', index);

// Route: Fetch public images by ID
router.get('/public_images/:slug', publicImages);

// Route: Fetch private images
router.post('/private_images', privateImages);

// Export the router for use in the application
export default router;
