import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir } from 'fs/promises';
import { join } from 'path';

export const index = async (req, res) => {
    try {
        // Get photo gallery data
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        
        // Read Q&A partial files
        const partialsDir = join(process.cwd(), 'Qapartials');
        const partialFiles = await readdir(partialsDir);
        
        // Create an object of available partials
        const qaPartials = partialFiles
            .filter(file => file.endsWith('.handlebars'))
            .reduce((acc, file) => {
                const partialName = file.replace('.handlebars', '');
                acc[partialName] = true;
                return acc;
            }, {});

        // Render the template with both photo gallery and Q&A data
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
