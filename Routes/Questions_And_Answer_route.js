import { Router } from 'express';
import { index } from '../Controller/Questions_And_Answer.js';
const router = new Router();

// Replace the simple route with the enhanced version
router.get('/', async (req, res, next) => {
    try {
        // Get data from your controller
        const data = await index();
        
        // Render the template with controller data
        res.render('questionnaire_and_answer', {
            ...data
        });
    } catch (error) {
        next(error);
    }
});

export default router;
