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
                const groupName = file.replace('.handlebars', '');
                const filePath = join(partialsDir, file);
                try {
                    const content = await readFile(filePath, 'utf-8');
                    qaContent[groupName] = content;
                } catch (err) {
                    console.warn(`Warning: Could not read partial ${file}:`, err);
                    // Continue with other files if one fails
                }
            }
        }

        // Map categories to their display names and available content
        const categories = Object.entries(categoriesConfig).map(([key, category]) => ({
            key,
            displayName: category.displayName,
            ids: category.ids,
            hasContent: !!qaContent[category.displayName.toLowerCase()]
        }));

        // Render the template with all necessary data
        // In Controller/Questions_And_Answer.js
res.render('Pages/Questions_And_Answer', {
    Photo_Gallary,
    qaContent,
    categories: Object.entries(categoriesConfig).map(([key, group]) => ({
        ...group,
        key,
        items: group.ids.map(id => ({
            id,
            displayName: generateCategoryLinkText(id)
        }))
    })),
    title: 'Q&As',
    layout: 'main'
});


    } catch (error) {
        console.error('Error loading Q&A content:', error);
        res.status(500).render("Pages/404", { error });
    }
};
