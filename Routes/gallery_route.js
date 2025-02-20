import { Router } from 'express';
import { index, publicImages, privateImages } from '../Controller/gallery.js'; // Changed from Photo_Gallary.js

const router = new Router();

router.get('/:id', index); // Changed from galleryId to id to match controller
router.get('/public_images/:id', publicImages); // Fixed route name and parameter
router.post('/private_images', privateImages); // Fixed route name

export default router;
