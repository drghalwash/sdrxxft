import { Router } from 'express';
import { index, publicImages, privateImages } from '../Controller/gallery.js';

const router = Router();

// Gallery Index Route (Slug Based)
router.get('/:slug', (req, res, next) => {
    console.log(`[Route] GET /:slug - Fetch gallery by slug: ${req.params.slug}`);
    next();
}, index);

// Public Images Route (Slug Based)
router.get('/public_images/:slug', (req, res, next) => {
    console.log(`[Route] GET /public_images/:slug - Fetch public images by slug: ${req.params.slug}`);
    next();
}, publicImages);

// Private Images Route (POST)
router.post('/private_images', (req, res, next) => {
    console.log('[Route] POST /private_images - Attempting to access private images`);
    next();
}, privateImages);

export default router;
