/* 
  File: /routes/Questions_And_Answer_route.js
  Description:
    - Sets up an Express router to handle requests for individual Q&A categories.
    - Reads the corresponding Q&A text file from /Qapartials based on the URL parameter ":categoryId".
    - Parses header lines (##CATEGORY_ID and ##TITLE) and then extracts the Q&A pairs.
    - Renders the 'qna-category' Handlebars template with the parsed data.
*/

import express from 'express';      // Import Express framework
import fs from 'fs';                // Import filesystem module
import path from 'path';            // Import path module for file paths

const router = express.Router();    // Create a new router instance

// Define route handler for a given category ID
router.get('/:categoryId', (req, res) => {
  // 1. Retrieve the categoryId from the URL parameter
  const { categoryId } = req.params;

  // 2. Build the full absolute path to the Q&A text file for this category.
  // The file is expected to be named exactly as the category ID with a .txt extension.
  const filePath = path.join(process.cwd(), 'Qapartials', `${categoryId}.txt`);

  // 3. Read the file asynchronously
  fs.readFile(filePath, 'utf8', (err, data) => {
    // If error reading the file, log error and send a 404 response.
    if (err) {
      console.error(`Error reading file for category '${categoryId}':`, err);
      return res.status(404).send('Category not found');
    }

    // 4. Split the file content into lines
    const lines = data.split('\n');

    // 5. Extract the title from the header line starting with "##TITLE="
    const titleLine = lines.find(line => line.startsWith('##TITLE='));
    const title = titleLine ? titleLine.split('=')[1].trim() : 'Untitled';

    // 6. Filter out header lines ("##CATEGORY_ID=" and "##TITLE=") to get the Q&A content only.
    const contentLines = lines.filter(line => 
      !line.startsWith('##CATEGORY_ID=') && !line.startsWith('##TITLE=')
    );

    // 7. Initialize an empty array to gather Q&A pairs.
    const qnaPairs = [];
    let currentQna = null;  // This will hold the current Q&A object during parsing.

    // 8. Loop over every content line to parse questions and answers.
    contentLines.forEach(line => {
      // Look for a line that starts with a number and a dot (e.g., "1. What is ...?")
      const match = line.match(/^(\d+)\.\s*(.+)/);
      if (match) {
        // If we already have a current Q&A pair, push it into the array.
        if (currentQna) {
          currentQna.answer = currentQna.answer.trim(); // Trim trailing spaces
          qnaPairs.push(currentQna);
        }
        // Start a new Q&A pair with the extracted question text.
        currentQna = {
          question: match[2].trim(), // Extracted question (text after '1. ')
          answer: ''                 // Initialize empty answer
        };
      } else if (currentQna) {
        // For non-question lines, accumulate text as part of the answer.
        currentQna.answer += line.trim() + ' ';
      }
    });

    // 9. After processing all lines, add the last Q&A pair if it exists.
    if (currentQna) {
      currentQna.answer = currentQna.answer.trim();
      qnaPairs.push(currentQna);
    }

    // 10. Render the Handlebars template 'qna-category'
    // Pass the following variables for template processing:
    // - categoryId : the current category id
    // - title      : the title from the header
    // - qnaPairs   : an array of {question, answer} objects
    res.render('qna-category', {
      categoryId,
      title,
      qnaPairs
    });
  });
});

// Export the router so that it can be included in your main server file
export default router;
