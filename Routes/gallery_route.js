// gallery_route.js
import { Router } from 'express';
import { index, privateImage } from '../Controller/gallery.js';

const router = new Router();

// Route: Fetch gallery by slug (e.g., .com/galleries/Face)
router.get('/:slug', index);

// Route: Access private image with password validation (e.g., .com/galleries/Face/botox)
router.post('/:gallery_slug/:image_slug', privateImage);

export default router;
