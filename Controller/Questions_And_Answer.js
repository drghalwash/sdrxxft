// File: /Controller/Questions_And_Answer.js
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir } from 'fs/promises';
import { join } from 'path';

export const index = async (req, res) => {
    try {
        // Get photo gallery data
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        
        // Read all partial files from the Qapartials folder (which is in the root directory)
        const partialsDir = join(process.cwd(), 'Qapartials');
        const partialFiles = await readdir(partialsDir);
        
        // Build an array of partial names (removing the '.handlebars' extension)
        const qaPartials = partialFiles
            .filter(file => file.endsWith('.handlebars'))
            .map(file => file.replace('.handlebars', ''));
        
        // Render the template with both gallery and Q&A dynamic partial names
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
