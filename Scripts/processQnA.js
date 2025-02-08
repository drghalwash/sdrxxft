/*
  File: /scripts/processQnA.js
  Description:
    This Node.js script processes every Q&A text file in the /Qapartials directory.
    It:
    • Reads each file (e.g., pocketlift.txt) that contains a header (##CATEGORY_ID and ##TITLE)
      followed by numbered Q&A pairs.
    • Parses the file content, assembling the Q&A text into pairs using a regex that detects when 
      a new numbered question begins.
    • Constructs an HTML snippet wrapped in a container div using Bootstrap accordion markup.
    • Outputs a Handlebars partial file (with a .handlebars extension) named exactly after the
      category id (e.g., pocketlift.handlebars).
*/

const fs = require('fs');
const path = require('path');

// Define directories:
// INPUT_DIR: where your source Q&A .txt files reside (e.g., QApartials folder)
// OUTPUT_DIR: where the generated partial files should be written.
// (In this example, we write the partials to the same folder as the source .txt files.)
const INPUT_DIR = path.join(process.cwd(), 'Qapartials');
const OUTPUT_DIR = INPUT_DIR;  // Change if you want a separate folder for generated partials

// Function to process an individual Q&A text file and generate a Handlebars partial.
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // Split full file content into trimmed lines
  const lines = fileContent.split('\n').map(line => line.trim());

  // --- Extract Header Information ---
  // Ensure the first two lines declare the category id and title
  const categoryLine = lines[0] || '';
  const titleLine = lines[1] || '';
  if (!categoryLine.startsWith('##CATEGORY_ID=') || !titleLine.startsWith('##TITLE=')) {
    console.error(`File ${filePath} does not contain valid header lines.`);
    return;
  }
  // Extract values from header lines.
  const categoryId = categoryLine.split('=')[1].trim();
  const title = titleLine.split('=')[1].trim();

  // --- Parse Q&A Pairs ---
  // Remove header lines and any blank lines.
  const contentLines = lines.slice(2).filter(line => line !== '');

  // Initialize array to hold each Q&A pair.
  const qnaPairs = [];
  let currentQna = null;
  
  // Regex to match a question line beginning with a number and a dot.
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  
  contentLines.forEach(line => {
    const match = line.match(questionRegex);
    if (match) {
      // If an existing Q&A pair exists, clean up and push it into the array.
      if (currentQna) {
        currentQna.answer = currentQna.answer.trim();
        qnaPairs.push(currentQna);
      }
      // Start a new Q&A object with the question text.
      currentQna = {
        question: match[2].trim(),  // Text after '1. '
        answer: ''                  // Answer will be accumulated next.
      };
    } else if (currentQna) {
      // Lines not matching the question pattern are part of the answer.
      currentQna.answer += line + ' ';
    }
  });
  // Add the last Q&A pair
  if (currentQna) {
    currentQna.answer = currentQna.answer.trim();
    qnaPairs.push(currentQna);
  }

  // --- Generate HTML (Bootstrap Accordion Format) ---
  // Wrap individual Q&A pairs into accordion items.
  let accordionHTML = `<div class="accordion" id="accordion-${categoryId}">\n`;
  qnaPairs.forEach((pair, index) => {
    const itemId = `${categoryId}-item-${index}`;
    accordionHTML += `
  <div class="accordion-item">
    <h2 class="accordion-header" id="heading-${itemId}">
      <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" 
              type="button" data-bs-toggle="collapse"
              data-bs-target="#collapse-${itemId}"
              aria-expanded="${index === 0 ? 'true' : 'false'}"
              aria-controls="collapse-${itemId}">
        ${pair.question}
      </button>
    </h2>
    <div id="collapse-${itemId}" 
         class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
         aria-labelledby="heading-${itemId}" 
         data-bs-parent="#accordion-${categoryId}">
      <div class="accordion-body">
        ${pair.answer}
      </div>
    </div>
  </div>`;
  });
  accordionHTML += `\n</div>`;

  // Wrap the accordion in a full container. Use a custom comment for clarity.
  const partialHTML = `{{!-- Auto-generated partial for ${title} --}}\n<div id="${categoryId}" class="qa-category mb-8">\n  <h2 class="qa-heading">${title}</h2>\n  ${accordionHTML}\n</div>`;

  // --- Write the Handlebars Partial File ---
  // Determine the output file path: use the base name (e.g., pocketlift) and change .txt to .handlebars.
  const baseName = path.basename(filePath, '.txt');
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.handlebars`);
  fs.writeFileSync(outputPath, partialHTML, 'utf-8');
  console.log(`Generated partial: ${outputPath}`);
}

// --- Process All Q&A Files in the INPUT_DIR ---
// Read all files in the QApartials folder.
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error('Error reading QApartials directory:', err);
    return;
  }
  // Filter only .txt files.
  files.filter(file => file.endsWith('.txt')).forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    processFile(filePath);
  });
});
