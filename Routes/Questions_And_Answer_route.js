import { Router } from 'express';
import { index } from '../Controller/Questions_And_Answer.js';
const router = new Router();
router.get('/', index);

router.get('/:group', async (req, res) => {
    const group = req.params.group; // Retrieve the group from the URL

    try {
        res.render('Questions_And_Answer', { group });
    } catch (error) {
        console.error("Failed to render template:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
