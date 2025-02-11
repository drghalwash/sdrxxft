// File: Controller/Questions_And_Answer.js

import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { categoriesConfig } from '../config/categoryConfig.js';

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
