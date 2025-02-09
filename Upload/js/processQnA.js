/*
  File: /upload/js/processQnA.js
  Description:
    • Scans the /Qapartials folder for source Q&A .txt files.
    • Each file must start with exactly two header lines:
         – "##CATEGORY_ID=<your_categoryid>" (unique identifier used in element IDs)
         – "##TITLE=<display title>" (for display in the Q&A block header)
    • The remaining lines contain numbered question-answer pairs.
    • The script generates a Bootstrap accordion structure and wraps it in
      a container matching your layout. The output is written as a Handlebars
      partial (with the same basename as the source, but with a ".handlebars" extension).
    • This version uses a consistent variable name “categoryid” (all lowercase)
      to avoid errors from mixed naming (e.g. categoryId vs categoryid).
    • No modifications in your routes/controllers are needed as long as
      the generated partials exist and match the names referenced in your views.
*/

const fs = require('fs');         // Node.js filesystem module
const path = require('path');       // For building cross-platform file paths

// ----------------------------------------------------------------------
// Directories Setup:
// INPUT_DIR: Folder containing Q&A .txt files (placed in /Qapartials).
// OUTPUT_DIR: Destination for generated .handlebars files (kept the same here).
// ----------------------------------------------------------------------
const INPUT_DIR = path.join(process.cwd(), 'Qapartials');
const OUTPUT_DIR = INPUT_DIR; // Using the same folder for output partials

// ----------------------------------------------------------------------
// Function: generateAccordionHTML
// Purpose: Build the inner Bootstrap accordion HTML based on Q&A pairs.
// Uses consistently “categoryid” in all string interpolations.
// ----------------------------------------------------------------------
function generateAccordionHTML(categoryid, qnaPairs) {
  let accordionHTML = `<div class="custom-accordion" id="accordion_${categoryid}">\n`;

  qnaPairs.forEach((pair, index) => {
    const itemIndex = index + 1; // User-friendly numbering starting at 1
    const btnClass = index === 0 ? "btn btn-link" : "btn btn-link collapsed";
    const ariaExpanded = index === 0 ? "true" : "false";
    const collapseClass = index === 0 ? "accordion-collapse collapse show" : "accordion-collapse collapse";

    accordionHTML += `
      <div class="accordion-item">
        <h2 class="mb-0">
          <button class="${btnClass}" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#${categoryid}_q${itemIndex}" 
                  aria-expanded="${ariaExpanded}" 
                  aria-controls="${categoryid}_q${itemIndex}">
            ${pair.question.trim()}
          </button>
        </h2>
        <div id="${categoryid}_q${itemIndex}" 
             class="${collapseClass}" 
             aria-labelledby="heading_${categoryid}_${itemIndex}" 
             data-bs-parent="#accordion_${categoryid}">
          <div class="accordion-body">
            <p class="answer">
              ${pair.answer.trim()}
            </p>
          </div>
        </div>
      </div>`;
  });

  accordionHTML += `\n</div>`;
  return accordionHTML;
}

// ----------------------------------------------------------------------
// Function: wrapInCategoryContainer
// Purpose: Encase the accordion HTML in a complete HTML container structure.
// Uses the consistent variable name “categoryid” in the header element.
// ----------------------------------------------------------------------
function wrapInCategoryContainer(categoryid, title, accordionHTML) {
  return `<div class="mb-8">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-11 col-xl-10">
        <div class="d-flex align-items-end mb-5">
          <h3 class="m-0" id="${categoryid}">${title}</h3>
        </div>
      </div>
      <div class="col-11 col-xl-10">
        <div class="col-lg-5 mt-4 mt-lg-0" data-aos="fade-up" data-aos-delay="100" style="width: 100% !important;">
${accordionHTML}
        </div>
      </div>
    </div>
  </div>
</div>`;
}

// ----------------------------------------------------------------------
// Function: processFile
// Purpose: Reads and processes a single Q&A .txt file:
//   - Validates the first two header lines for "##CATEGORY_ID=" and "##TITLE=".
//   - Extracts the unique categoryid and display title.
//   - Parses numbered Q&A pairs using a robust regex pattern.
//   - Generates and writes the complete HTML into a .handlebars file.
// ----------------------------------------------------------------------
function processFile(filePath) {
  // Read file content with UTF-8 encoding
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split the content into non-empty trimmed lines
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Check that the first two lines are valid headers
  const categoryLine = lines[0] || '';
  const titleLine = lines[1] || '';
  
  if (!categoryLine.startsWith('##CATEGORY_ID=') || !titleLine.startsWith('##TITLE=')) {
    console.error(`File ${filePath} does not contain valid header lines.
    Expected first two lines:
      ##CATEGORY_ID=<your_categoryid>
      ##TITLE=<your_display_title>`);
    return; // Abort processing for this file
  }

  // Extract and use a consistent variable: categoryid (all lowercase)
  const categoryid = categoryLine.split('=')[1].trim();
  const title = titleLine.split('=')[1].trim();

  // Parse Q&A from remaining lines; remove header lines
  const contentLines = lines.slice(2);
  const qnaPairs = [];
  let currentQna = null;

  // Regex to detect a new question line (e.g., "1. What is...")
  const questionRegex = /^\d+\.\s*(.+)$/;

  contentLines.forEach(line => {
    const match = line.match(questionRegex);
    if (match) {
      // On finding a new question, push previous pair if it exists
      if (currentQna) {
        currentQna.answer = currentQna.answer.trim();
        qnaPairs.push(currentQna);
      }
      // Begin a new Q&A pair with the captured question text
      currentQna = {
        question: match[1].trim(),
        answer: ''
      };
    } else if (currentQna) {
      // Append lines to the current answer (preserving spaces)
      currentQna.answer += line + ' ';
    }
    // Lines before the first question are ignored
  });

  // Push the final Q&A pair if it exists
  if (currentQna) {
    currentQna.answer = currentQna.answer.trim();
    qnaPairs.push(currentQna);
  }

  // Generate the accordion HTML and wrap it in the container structure
  const accordionHTML = generateAccordionHTML(categoryid, qnaPairs);
  const finalHTML = wrapInCategoryContainer(categoryid, title, accordionHTML);

  // Determine the output file path: same basename as source, but with .handlebars extension
  const baseName = path.basename(filePath, '.txt');
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.handlebars`);
  
  // Write the generated HTML to the output file with UTF-8 encoding
  fs.writeFileSync(outputPath, finalHTML, 'utf-8');
  console.log(`Successfully generated partial: ${outputPath}`);
}

// ----------------------------------------------------------------------
// Main Execution: Process all .txt files in the INPUT_DIR folder.
// ----------------------------------------------------------------------
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error('Error reading the Qapartials directory:', err);
    return;
  }

  // Filter for files ending in .txt (ignoring already generated .handlebars files)
  files.filter(file => file.endsWith('.txt')).forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    processFile(filePath);
  });
});
