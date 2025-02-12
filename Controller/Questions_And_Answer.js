// File: /Controller/Questions_And_Answer.js
// ----------------------------------------------------------------
// Add these lines at the top if they aren’t already present.
// They allow you to compute the correct absolute paths.
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ----------------------------------------------------------------

// Replace the following line:
//// const partialsDir = join(process.cwd(), 'Qapartials');

// With this corrected path:
// (Assuming that /Controller is a subfolder of your project root,
// you go one level up to reach the Qapartials directory.)
const partialsDir = join(__dirname, '../Qapartials'); // Adjust relative path as needed
// ----------------------------------------------------------------

import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir } from 'fs/promises';

export const index = async (req, res) => {
    try {
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        // Read all partial file names from the correct Qapartials directory
        const partialFiles = await readdir(partialsDir);

        // Remove file extensions to create an array of partial names.
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
