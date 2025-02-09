/*
  File: /upload/js/processQnA.js
  Description:
    • Processes Q&A text files found in the QApartials folder.
    • Each file must start with two header lines:
         - "##CATEGORY_ID=<categoryId>" (unique identifier, used for element IDs)
         - "##TITLE=<display title>" (used in the header of the Q&A block)
    • The remaining lines contain Q&A pairs. Each Q&A pair is marked by a numbered line,
      e.g. "1. What is ...", and subsequent lines (until the next number) are the answer.
    • A robust regex is used so that any numbers inside answers are not misinterpreted.
    • The script then builds HTML for a Bootstrap accordion that exactly mirrors your manual
      layout (including container classes, data attributes, and custom classes).
    • The generated file is saved with the same basename as the source but with a ".handlebars"
      extension, ensuring compatibility with your Handlebars view engine.
    • Detailed inline annotations explain every section of the code.
*/

const fs = require('fs');         // Filesystem module for reading/writing files.
const path = require('path');     // Path module for handling platform-independent paths.

// ----------------------------------------------------------------------
// Set Directories
// INPUT_DIR: Folder containing your Q&A source text files.
// OUTPUT_DIR: Where to output the generated partials (set to same folder here).
// ----------------------------------------------------------------------
const INPUT_DIR = path.join(process.cwd(), 'Qapartials');
const OUTPUT_DIR = INPUT_DIR; // Keeping generated partials in the same folder.

// ----------------------------------------------------------------------
// Function: generateAccordionHTML
// Purpose:
// - Builds the inner HTML of a Bootstrap accordion for Q&A pairs.
// - Each pair becomes an accordion item; the first item is open by default.
// Parameters:
//   categoryId: the unique identifier (used for generating element IDs)
//   qnaPairs: an array where each element is an object with 'question' and 'answer'
// Returns:
//   A string containing the complete accordion HTML.
// ----------------------------------------------------------------------
function generateAccordionHTML(categoryId, qnaPairs) {
  // Start the accordion container with a custom ID.
  let accordionHTML = `<div class="custom-accordion" id="accordion_${categoryId}">\n`;

  // Loop through each Q&A pair and build an accordion item.
  qnaPairs.forEach((pair, index) => {
    const itemIndex = index + 1; // For user-friendly numbering starting from 1.
    // For the first item, set to open (expanded); others are collapsed.
    const btnClass = index === 0 ? "btn btn-link" : "btn btn-link collapsed";
    const ariaExpanded = index === 0 ? "true" : "false";
    const collapseClass = index === 0 ? "accordion-collapse collapse show" : "accordion-collapse collapse";

    // Append the HTML for this accordion-item.
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

  // Close the accordion container.
  accordionHTML += `\n</div>`;
  return accordionHTML;
}

// ----------------------------------------------------------------------
// Function: wrapInCategoryContainer
// Purpose:
// - Wraps the generated accordion HTML in the complete HTML structure
//   that matches your manual partial layout.
// - This structure includes Bootstrap container, row, column elements,
//   a header (h3) with the category’s id, and attributes for animations (data-aos).
// Parameters:
//   categoryId: used in the header element’s id
//   title: the display title extracted from the file header
//   accordionHTML: the HTML string produced by generateAccordionHTML()
// Returns:
//   A string containing the full HTML layout for the Q&A block.
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// Function: processFile
// Purpose:
// - Reads a Q&A text file,
// - Extracts header information (lines #1 and #2 should provide CATEGORY_ID and TITLE),
// - Processes subsequent lines to build Q&A pairs.
// - Uses a robust regex so that only lines starting with a number + dot + space are
//   treated as a new question. This avoids picking up any numbers within answers.
// - After parsing, it generates the complete HTML and writes it out as a .handlebars file.
// Parameters:
//   filePath: the full path to the source .txt file.
// ----------------------------------------------------------------------
function processFile(filePath) {
  // 1. Read the file content; specify 'utf-8' for proper string encoding.
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // 2. Break the content into lines, remove extra whitespace, and filter out any empty lines.
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // 3. Validate header lines:
  //    - First line must start with "##CATEGORY_ID=".
  //    - Second line must start with "##TITLE=".
  const categoryLine = lines[0] || '';
  const titleLine = lines[1] || '';
  if (!categoryLine.startsWith('##CATEGORY_ID=') || !titleLine.startsWith('##TITLE=')) {
    console.error(`File ${filePath} is missing valid header lines.
Please ensure the first two lines are:
   ##CATEGORY_ID=<your_category_id>
   ##TITLE=<your_display_title>`);
    return;
  }
  // 4. Extract the category id and title from the header lines.
  const categoryId = categoryLine.split('=')[1].trim();
  const title = titleLine.split('=')[1].trim();

  // 5. Process the remaining lines as Q&A content.
  //    We remove the first two header lines and work on the rest.
  const contentLines = lines.slice(2);
  const qnaPairs = [];
  let currentQna = null;
  // Regex to match only lines that start with a number, followed by a dot and at least one space.
  const questionRegex = /^\d+\.\s+(.+)/; 

  // Loop over each line in the content.
  contentLines.forEach(line => {
    const match = line.match(questionRegex);
    if (match) {
      // When you find a new question:
      //   a) If there's an existing Q& A pair, push it to the array.
      if (currentQna) {
        currentQna.answer = currentQna.answer.trim();
        qnaPairs.push(currentQna);
      }
      //   b) Start a new Q&A pair with the captured question text.
      currentQna = {
        question: match[1].trim(), // Capture group from regex.
        answer: ''                 // Initialize empty answer.
      };
    } else if (currentQna) {
      // If the line does NOT match a new question (even if it contains digits),
      // then append it to the current answer.
      currentQna.answer += line + ' ';
    }
    // Lines before any question is detected are ignored.
  });
  // 6. After processing all lines, don't forget to push the final Q&A pair.
  if (currentQna) {
    currentQna.answer = currentQna.answer.trim();
    qnaPairs.push(currentQna);
  }

  // 7. Generate the accordion HTML content using the array of Q&A pairs.
  const accordionHTML = generateAccordionHTML(categoryId, qnaPairs);
  // 8. Wrap the accordion HTML into the full Q&A container structure.
  const finalHTML = wrapInCategoryContainer(categoryId, title, accordionHTML);

  // 9. Determine the output file path:
  //     - Use the same base filename as the source, but change the extension to .handlebars.
  const baseName = path.basename(filePath, '.txt');
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.handlebars`);

  // 10. Write the final HTML to the output file with UTF-8 encoding.
  fs.writeFileSync(outputPath, finalHTML, 'utf-8');

  // Log success.
  console.log(`Successfully generated partial: ${outputPath}`);
}

// ----------------------------------------------------------------------
// Main Execution: Process all .txt files within the INPUT_DIR.
// ----------------------------------------------------------------------
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error('Error reading the QApartials directory:', err);
    return;
  }
  
  // Filter for files that end with .txt to be processed.
  const inputFiles = files.filter(file => file.endsWith('.txt'));
  inputFiles.forEach(file => {
    const filePath = path.join(INPUT_DIR, file);
    processFile(filePath);
  });
});
