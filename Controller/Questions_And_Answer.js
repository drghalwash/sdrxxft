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
        
// File: /Controller/Questions_And_Answer.js (Modification)
// After line 11 (where qaPartials is created)
const qaPartials = partialFiles
    .filter(file => file.endsWith('.handlebars'))
        .map(file => file.replace('.handlebars', ''));  // Change from object to array

        // Then modify the render call to pass as array instead of object
        res.render('Pages/Questions_And_Answer', {
            Photo_Gallary,
                qaPartials,  // Now an array of partial names
                    title: 'Q&As',
                        layout: 'main'
                        });


    } catch (error) {
        console.error('Error loading Q&A content:', error);
        res.status(500).render("Pages/404", { error });
    }
};
