/*
  File: /routes/Questions_And_Answer_route.js
  Description:
    • Handles incoming Q&A page requests.
    • GET "/" renders the main Q&A page which includes all auto‑generated Q&A partials.
    • GET "/:categoryId" validates the category against categoryConfig and (if valid) reads its 
      corresponding Q&A text file from QApartials, extracts the title from the header, and renders 
      a dedicated category page.
    • This file relies on the centralized configuration in /config/categoryConfig.js.
*/

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { categoriesConfig } from '../config/categoryConfig.js';

const router = express.Router();

// Route: Main Q&A page—renders the main questionnaire_and_answer template.
router.get('/', async (req, res) => {
  try {
    // Renders a template (questionnaire_and_answer.handlebars) that includes auto‑generated partials.
    res.render('questionnaire_and_answer');
  } catch (error) {
    console.error("Error rendering main Q&A page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: Individual Q&A category page.
router.get('/:categoryid', async (req, res) => {
  const { categoryid } = req.params;
  // Verify that the passed categoryid exists in categoriesConfig.
  const isValid = Object.values(categoriesConfig).some(group => group.ids.includes(categoryid));
  if (!isValid) {
    return res.status(404).send("Category not found");
  }

  // Build the absolute path to the Q&A text file for the requested category.
  const filePath = path.join(process.cwd(), 'Qapartials', `${categoryid}.txt`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    // Split and trim the file content to extract header lines.
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Extract the title from the header line starting with "##TITLE="
    const titleLine = lines.find(line => line.startsWith('##TITLE='));
    const title = titleLine ? titleLine.split('=')[1].trim() : categoryid;
    
    // Render the individual Q&A category page (qna-category.handlebars) with the category details.
    res.render('qna-category', { categoryid, title });
  } catch (err) {
    console.error(`Error processing Q&A file for category "${categoryid}":`, err);
    res.status(404).send("Category content not found");
  }
});

export default router;
