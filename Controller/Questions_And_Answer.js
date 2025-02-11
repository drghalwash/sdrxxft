// File: Controller/Questions_And_Answer.js

import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const categoriesConfig = {
    face: {
        displayName: 'Face',
        ids: ['rhinoplasty', 'facelift', 'eyelidlift']
    },
    breast: {
        displayName: 'Breast',
        ids: ['breastpsycho', 'lollipoptechnique', 'miniinvasivebreast', 'breastaugmentation', 'pocketlift']
    },
    body: {
        displayName: 'Body',
        ids: ['bodycontouring', 'fatgrafting', 'tummytuck', 'brazilianbuttlift', 'mommyMakeover']
    },
    minimallyinvasive: {
        displayName: 'Minimally Invasive',
        ids: ['botoxfillers', 'noninvasivecontouring']
    },
    other: {
        displayName: 'Other',
        ids: ['hairtransplant', 'skinresurfacing']
    }
};

export const index = async (req, res) => {
    try {
        // Get photo gallery data
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        
        // Read Q&A partial files
        const partialsDir = join(process.cwd(), 'Qapartials');
        const partialFiles = await readdir(partialsDir);
        
        // Read the content of each partial file
        const qaContent = {};
        for (const file of partialFiles) {
            if (file.endsWith('.handlebars')) {
                const categoryId = file.replace('.handlebars', '');
                const filePath = join(partialsDir, file);
                try {
                    const content = await readFile(filePath, 'utf-8');
                    qaContent[categoryId] = content;
                } catch (err) {
                    console.warn(`Warning: Could not read partial ${file}:`, err);
                }
            }
        }

        // Map categories and check for actual content
        const categories = Object.entries(categoriesConfig).map(([key, category]) => {
            const hasContent = category.ids.some(id => qaContent[id]);
            return {
                key,
                displayName: category.displayName,
                ids: category.ids.filter(id => qaContent[id]), // Only include IDs with content
                hasContent
            };
        }).filter(category => category.hasContent); // Only include categories with content

        // Render the template with all necessary data
        res.render('Pages/Questions_And_Answer', {
            Photo_Gallary,
            qaContent,
            categories,
            title: 'Q&As',
            layout: 'main'
        });

    } catch (error) {
        console.error('Error loading Q&A content:', error);
        res.status(500).render("Pages/404", { error });
    }
};
