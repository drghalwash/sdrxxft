import { Router } from 'express';
import { index,blog_back } from '../Controller/Read_More.js';
const router = new Router();
router.get('/:id' ,index);
router.get('/blog_back/:id' ,blog_back);

export default router;