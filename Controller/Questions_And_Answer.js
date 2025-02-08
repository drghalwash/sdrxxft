// File: /controllers/Questions_And_Answer.js
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";
import { readdir } from 'fs/promises';
import { join } from 'path';
import { categoriesConfig } from '../config/categoryConfig.js'; // NEW: Import centralized config

export const index = async (req, res) => {
  try {
    // 1. Get photo gallery data (existing functionality)
    const Photo_Gallary = await Photo_Gallaries.find({}).lean();
    
    // 2. Validate Q&A partials against categoriesConfig (CRUCIAL IMPROVEMENT)
    const validCategoryIds = Object.values(categoriesConfig)
      .flatMap(group => group.ids);

    // 3. Read & filter partials using centralized config (PINPOINT ACCURACY)
    const partialsDir = join(process.cwd(), 'Qapartials');
    const partialFiles = await readdir(partialsDir);
    const qaPartials = partialFiles
      .filter(file => 
        file.endsWith('.handlebars') && 
        validCategoryIds.includes(file.replace('.handlebars', ''))
      )
      .reduce((acc, file) => {
        const partialName = file.replace('.handlebars', '');
        acc[partialName] = true;
        return acc;
      }, {});

    // 4. Render template with verified data (ENHANCED RELIABILITY)
    res.render('Pages/Questions_And_Answer', {
      Photo_Gallary,
      qaPartials,
      categoriesConfig: JSON.stringify(categoriesConfig), // For client-side hydration
      title: 'Q&As',
      layout: 'main'
    });

  } catch (error) {
    console.error('Error loading Q&A content:', error);
    res.status(500).render("Pages/404", { error });
  }
};
