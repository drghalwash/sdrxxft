import { Router } from 'express';
import { index,Public_images,Private_images } from '../Controller/Photo_Gallary.js';
const router = new Router();
router.get('/:galleryId' ,index);
router.get('/publicImages/:galleryId' ,publicImages);
router.post('/privateImages' ,privateImages);

export default router;
