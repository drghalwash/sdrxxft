/*
  File: /scripts/processQnA.js
  Description:
    This script processes each Q&A text file in the /Qapartials folder.
    It reads each file (e.g. pocketlift.txt), validates header lines (##CATEGORY_ID and ##TITLE),
    parses numbered Q&A pairs, and builds an HTML snippet using the exact structure defined in your
    manually created miniinvasivebreast.handlebars.
  
    The generated partial has:
      • An outer container with class "mb-8"
      • Nested Bootstrap container, row, and cols matching your manual markup
      • A header <h3> with id set to the category id and with your title text
      • A custom accordion div with id "accordion_{categoryId}" that contains accordion-item blocks,
        each with a button and collapse container in the same structure as your manual partial.
*/

const fs = require('fs');
const path = require('path');

// Directories: The input Q&A text files reside in Qapartials (adjust if different)
const INPUT_DIR = path.join(process.cwd(), 'Qapartials');
const OUTPUT_DIR = INPUT_DIR; // Change if you want output in another folder

// Function: Generate accordion items HTML from Q&A pairs using your custom markup.
function generateAccordionHTML(categoryId, qnaPairs) {
  let accordionHTML = `          <div class="custom-accordion" id="accordion_${categoryId}">\n`;

  qnaPairs.forEach((pair, index) => {
    const itemIndex = index + 1;
    // For the first item, the collapse is shown and the button is not collapsed.
    const btnClass = index === 0 ? "btn btn-link" : "btn btn-link collapsed";
    const ariaExpanded = index === 0 ? "true" : "false";
    const collapseClass = index === 0 ? "accordion-collapse collapse show" : "accordion-collapse collapse";
    // Build each accordion item (including button and collapse container)
    accordionHTML += `
            <!-- Q${itemIndex} -->
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
  accordionHTML += `\n          </div>`;
  return accordionHTML;
}

// Function: Wrap the accordion HTML in the full container structure matching your manual partial.
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

// Main function: Process a single Q&A text file.
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');

  // --- Extract Header Information ---
  const categoryLine = lines[0] || '';
  const titleLine = lines[1] || '';
  if (!categoryLine.startsWith('##CATEGORY_ID=') || !titleLine.startsWith('##TITLE=')) {
    console.error(`File ${filePath} does not contain valid header lines.`);
    return;
  }
  const categoryId = categoryLine.split('=')[1].trim();
  const title = titleLine.split('=')[1].trim();

  // --- Parse Q&A Pairs ---
  const contentLines = lines.slice(2); // remove headers
  const qnaPairs = [];
  let currentQna = null;
  const questionRegex = /^(\d+)\.\s*(.+)$/;

  contentLines.forEach(line => {
    const match = line.match(questionRegex);
    if (match) {
      if (currentQna) {
        currentQna.answer = currentQna.answer.trim();
        qnaPairs.push(currentQna);
      }
      currentQna = { question: match[2].trim(), answer: '' };
    } else if (currentQna) {
      // Append subsequent lines into answer
      currentQna.answer += line + ' ';
    }
  });
  if (currentQna) {
    currentQna.answer = currentQna.answer.trim();
    qnaPairs.push(currentQna);
  }

  // --- Generate Final HTML ---
  const accordionHTML = generateAccordionHTML(categoryId, qnaPairs);
  const finalHTML = wrapInCategoryContainer(categoryId, title, accordionHTML);

  // --- Write Output to .handlebars file ---
  const baseName = path.basename(filePath, '.txt');
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.handlebars`);
  fs.writeFileSync(outputPath, finalHTML, 'utf-8');
  console.log(`Generated partial: ${outputPath}`);
}

// Process all .txt files in the QApartials folder.
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
