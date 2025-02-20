import { Router } from 'express';
import { index,Public_images,Private_images } from '../Controller/gallery.js';
const router = new Router();
router.get('/:id' ,index);
router.get('/Public_images/:id' ,Public_images);
router.post('/Private_images' ,Private_images);

export default router;
