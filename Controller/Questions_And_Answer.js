// File: Controller/Questions_And_Answer.js

import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { categoriesConfig, categoryMap } from '../categoryConfig.js';

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
        }).filter(category => category.hasContent);

        // CSS for catnav
        const catnavCSS = `
            .categories-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-height: 300px;
                overflow-y: auto;
                overflow-x: hidden;
            }
            .categories {
                display: grid;
                grid-template-columns: repeat(4, minmax(200px, 1fr));
                gap: 15px;
            }
            .category-group {
                background-color: #ffffff;
                border: 2px solid #ffa500;
                border-radius: 8px;
                padding: 15px;
                break-inside: avoid;
            }
            .category-group h3 {
                background-color: #394464;
                color: white;
                font-family: Verdana, sans-serif;
                font-weight: bold;
                font-size: 1.1em;
                padding: 8px 15px;
                margin-bottom: 15px;
                border-radius: 0 20px 20px 0;
            }
            .category-item a {
                color: #495057;
                text-decoration: none;
                font-family: Verdana, sans-serif;
                font-size: 0.95em;
                transition: color 0.3s ease;
            }
            .category-item a:hover {
                color: #007bff;
                font-weight: bold;
            }
        `;

        // Render the template with all necessary data
        res.render('Pages/Questions_And_Answer', {
            Photo_Gallary,
            qaContent,
            categories,
            title: 'Q&As',
            layout: 'main',
            catnavCSS
        });

    } catch (error) {
        console.error('Error loading Q&A content:', error);
        res.status(500).render("Pages/404", { error });
    }
};
