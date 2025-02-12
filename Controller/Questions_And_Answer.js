// File: /Controller/Questions_And_Answer.js
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir } from 'fs/promises';
import { join } from 'path';

export const index = async (req, res) => {
    try {
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        const partialsDir = join(process.cwd(), 'Qapartials');
        const partialFiles = await readdir(partialsDir);

        const qaPartials = partialFiles
            .filter(file => file.endsWith('.handlebars'))
            .map(file => file.replace('.handlebars', ''));

        res.render('Pages/Questions_And_Answer', {
            Photo_Gallary,
            qaPartials,
            title: 'Q&As',
            layout: 'main'
        });
    } catch (error) {
        console.error('Error loading Q&A content:', error);
        res.status(500).render("Pages/404", { error });
    }
};
