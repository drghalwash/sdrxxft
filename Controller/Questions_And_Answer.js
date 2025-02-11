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

 const categoryDisplayNames = {
    rhinoplasty: 'Rhinoplasty',
    facelift: 'Facelift',
    eyelidlift: 'Eyelid Lift',
    breastpsycho: 'Breast Thinking all night',
    lollipoptechnique: 'Breast Reduction Lollipop technique',
    miniinvasivebreast: 'Thinking about mini invasive',
    breastaugmentation: 'Breast Augmentation',
    pocketlift: 'Pocket Lift Breast Reduction',
    bodycontouring: 'Body Contouring',
    fatgrafting: 'Fat Grafting',
    tummytuck: 'Tummy Tuck Abdominoplasty',
    brazilianbuttlift: 'Brazilian Butt Lift BBL',
    mommyMakeover: 'Mommy Makeover',
    botoxfillers: 'Botox Dermal Fillers',
    noninvasivecontouring: 'Non-Invasive Body Contouring',
    hairtransplant: 'Hair Transplant',
    skinresurfacing: 'LASER SKIN RESURFACING'
};

export const index = async (req, res) => {
    try {
        const Photo_Gallary = await Photo_Gallaries.find({}).lean();
        const partialsDir = join(process.cwd(), 'Qapartials');
        const partialFiles = await readdir(partialsDir);
        
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
        const categories = Object.entries(categoriesConfig).map(([key, category]) => ({
            key,
            displayName: category.displayName,
            ids: category.ids,
            hasContent: category.ids.some(id => qaContent[id])
        }));

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
