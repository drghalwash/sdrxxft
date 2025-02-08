/*
  File: /scripts/processQnA.js
  Description:
    • Processes Q&A text files in /Qapartials.
    • Parses headers (##CATEGORY_ID, ##TITLE) and numbered Q&A pairs.
    • Avoids misinterpreting embedded questions within answers.
    • Outputs auto-generated Handlebars partials with the correct .handlebars extension.
*/

const fs = require('fs');
const path = require('path');

// Directories
const INPUT_DIR = path.join(process.cwd(), 'Qapartials'); // Input directory for Q&A text files
const OUTPUT_DIR = INPUT_DIR; // Output directory for Handlebars partials

// Function: Generate accordion items HTML from Q&A pairs
function generateAccordionHTML(categoryId, qnaPairs) {
  let accordionHTML = `<div class="custom-accordion" id="accordion_${categoryId}">\n`;

  qnaPairs.forEach((pair, index) => {
    const itemIndex = index + 1;
    const btnClass = index === 0 ? "btn btn-link" : "btn btn-link collapsed";
    const ariaExpanded = index === 0 ? "true" : "false";
    const collapseClass = index === 0 ? "accordion-collapse collapse show" : "accordion-collapse collapse";

    accordionHTML += `
      <div class="accordion-item">
        <h2 class="mb-0">
          <button class="${btnClass}" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#${categoryId}_q${itemIndex}" 
                  aria-expanded="${ariaExpanded}" 
                  aria-controls="${categoryId}_q${itemIndex}">
            ${pair.question.trim()}
          </button>
        </h2>
        <div id="${categoryId}_q${itemIndex}" 
             class="${collapseClass}" 
             aria-labelledby="heading_${categoryId}_${itemIndex}" 
             data-bs-parent="#accordion_${categoryId}">
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

// Function: Wrap accordion HTML in a full container structure
function wrapInCategoryContainer(categoryId, title, accordionHTML) {
  return `<div class="mb-8">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-11 col-xl-10">
        <div class="d-flex align-items-end mb-5">
          <h3 class="m-0" id="${categoryId}">${title}</h3>
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

// Function: Process a single Q&A text file
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Extract headers
  const categoryLine = lines[0] || '';
  const titleLine = lines[1] || '';
  if (!categoryLine.startsWith('##CATEGORY_ID=') || !titleLine.startsWith('##TITLE=')) {
    console.error(`File ${filePath} does not contain valid header lines.`);
    return;
  }
  const categoryId = categoryLine.split('=')[1].trim();
  const title = titleLine.split('=')[1].trim();

  // Parse Q&A pairs
  const contentLines = lines.slice(2); // Remove headers
  const qnaPairs = [];
  let currentQna = null;
  
  // Regex to detect numbered questions (e.g., "1. Question text")
  const questionRegex = /^\d+\.\s*(.+)$/;

  contentLines.forEach(line => {
    const match = line.match(questionRegex);
    if (match) {
      // If a new question is found, save the current Q&A pair (if it exists)
      if (currentQna) {
        currentQna.answer = currentQna.answer.trim();
        qnaPairs.push(currentQna);
      }
      // Start a new Q&A pair with the question text
      currentQna = { question: match[1].trim(), answer: '' };
    } else if (currentQna) {
      // Append non-question lines to the current answer
      currentQna.answer += line + ' ';
    }
  });

  // Add the last Q&A pair (if it exists)
  if (currentQna) {
    currentQna.answer = currentQna.answer.trim();
    qnaPairs.push(currentQna);
  }

  // Generate final HTML
  const accordionHTML = generateAccordionHTML(categoryId, qnaPairs);
  const finalHTML = wrapInCategoryContainer(categoryId, title, accordionHTML);

  // Write output to .handlebars file
  const baseName = path.basename(filePath, '.txt'); // Ensure correct file extension
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.handlebars`);
  
  fs.writeFileSync(outputPath, finalHTML, 'utf-8');
  console.log(`Generated partial: ${outputPath}`);
}

// Process all .txt files in the input directory
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error('Error reading QApartials directory:', err);
    return;
  }
  
  files.filter(file => file.endsWith('.txt')).forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    processFile(filePath);
  });
});
