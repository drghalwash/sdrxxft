// File: processQnA.js
const fs = require('fs');
const path = require('path');

const QAPARTIALS_DIR = path.join(__dirname, 'Qapartials');
const OUTPUT_DIR = QAPARTIALS_DIR; // Output files will be saved in the same directory

// --- Function to process a single .txt file ---
function processQnAFile(filename) {
  if (!filename.endsWith('.txt')) return;

  const filepath = path.join(QAPARTIALS_DIR, filename);
  try {
    const content = fs.readFileSync(filepath, 'utf8');

    // Extract categoryId and title from the .txt file
    const categoryIdMatch = content.match(/##CATEGORY_ID=(.*)/);
    const titleMatch = content.match(/##TITLE=(.*)/);

    if (!categoryIdMatch || !titleMatch) {
      console.warn(`Skipping ${filename}: Missing CATEGORY_ID or TITLE`);
      return;
    }

    const categoryId = categoryIdMatch[1].trim();
    const title = titleMatch[1].trim();

    // Extract questions and answers
    const qnaRegex = /(\d+\.\s+.*?\n(?:(?!\d+\.\s).*?\n?)*)/gs;
    let match;
    const qnaPairs = [];
    while ((match = qnaRegex.exec(content)) !== null) {
      const qaText = match[0].trim();
      const question = qaText.match(/^\d+\.\s+(.*)/m)[1];
      const answer = qaText.replace(/^\d+\.\s+.*?\n/m, '').trim();
      qnaPairs.push({ question, answer });
    }

    // Build the Handlebars partial content
    const handlebarsContent = `
<div class="mb-8" id="${categoryId}">
  <h3>${title}</h3>
  <div class="accordion" id="accordion_${categoryId}">
    ${qnaPairs.map((qa, index) => `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading_${categoryId}_${index}">
          <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${categoryId}_${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse_${categoryId}_${index}">
            ${qa.question}
          </button>
        </h2>
        <div id="collapse_${categoryId}_${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading_${categoryId}_${index}" data-bs-parent="#accordion_${categoryId}">
          <div class="accordion-body">${qa.answer}</div>
        </div>
      </div>`).join('')}
  </div>
</div>
`;

    // Write the Handlebars file
    const outputFilename = path.join(OUTPUT_DIR, `${categoryId}.handlebars`);
    fs.writeFileSync(outputFilename, handlebarsContent, 'utf8');
    console.log(`Generated ${outputFilename}`);
  } catch (err) {
    console.error(`Error processing ${filename}:`, err);
  }
}

// --- Main function to process all .txt files ---
function main() {
  try {
    const files = fs.readdirSync(QAPARTIALS_DIR);
    files.forEach(file => processQnAFile(file));
    console.log('All files processed successfully!');
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

main();
