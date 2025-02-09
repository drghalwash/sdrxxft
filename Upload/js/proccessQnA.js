// File: /upload/js/processQnA.js
const fs = require('fs').promises;
const path = require('path');
const { EOL } = require('os');

// Atomic Processing Components
const qnaProcessor = {
  // Enhanced header validation with position tracking
  parseHeaders: (lines) => {
    const headerStructure = [
      { pattern: /^##CATEGORY_ID=(.+)$/, storeAs: 'categoryid' },
      { pattern: /^##TITLE=(.+)$/, storeAs: 'title' }
    ];

    return headerStructure.reduce((acc, { pattern, storeAs }, index) => {
      const match = lines[index]?.match(pattern);
      if (!match) throw new Error(`Invalid header at line ${index + 1}`);
      acc[storeAs] = match[1].trim();
      return acc;
    }, {});
  },

  // Advanced question detection with lookahead
  parseQuestions: (contentLines) => {
    const questionBlocks = contentLines.join('\n').split(/(?=^\d+\.\s)/gm);
    return questionBlocks.filter(Boolean).map(block => {
      const [questionLine, ...answerLines] = block.split('\n');
      const question = questionLine.replace(/^\d+\.\s*/, '').trim();
      const answer = answerLines.join(EOL).trim();
      return { question, answer };
    });
  },

  // Template generation with validation
  generateTemplate: (categoryid, title, qnaPairs) => {
    if (!qnaPairs.length) throw new Error('No Q&A pairs found');
    
    const accordionItems = qnaPairs.map((pair, index) => {
      const isFirst = index === 0;
      return `
        <div class="accordion-item">
          <h2 class="mb-0">
            <button class="btn btn-link${isFirst ? '' : ' collapsed'}" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#${categoryid}_q${index + 1}" 
                    aria-expanded="${isFirst}">
              ${pair.question}
            </button>
          </h2>
          <div id="${categoryid}_q${index + 1}" 
               class="accordion-collapse collapse${isFirst ? ' show' : ''}">
            <div class="accordion-body">
              <p>${pair.answer}</p>
            </div>
          </div>
        </div>`;
    }).join('\n');

    return `
      <div class="mb-8" data-category="${categoryid}">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-11 col-xl-10">
              <h3 id="${categoryid}" class="category-header">${title}</h3>
              <div class="accordion" id="accordion_${categoryid}">
                ${accordionItems}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }
};

// File Processing Pipeline
async function processQnAFile(filePath) {
  try {
    console.log(`Processing: ${path.basename(filePath)}`);
    
    const rawContent = await fs.readFile(filePath, 'utf8');
    const lines = rawContent.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length < 3) throw new Error('Insufficient content');
    
    const { categoryid, title } = qnaProcessor.parseHeaders(lines);
    const qnaPairs = qnaProcessor.parseQuestions(lines.slice(2));
    const template = qnaProcessor.generateTemplate(categoryid, title, qnaPairs);
    
    const outputPath = path.join(
      path.dirname(filePath),
      `${path.basename(filePath, '.txt')}.handlebars`
    );
    
    await fs.writeFile(outputPath, template);
    console.log(`Generated: ${path.basename(outputPath)}`);
    return true;

  } catch (error) {
    console.error(`Failed to process ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Main Execution Flow
async function main() {
  const QAPARTIALS_DIR = path.join(process.cwd(), 'Qapartials');
  
  try {
    const files = (await fs.readdir(QAPARTIALS_DIR))
      .filter(f => f.endsWith('.txt') && !f.endsWith('.handlebars.txt'));
    
    if (!files.length) {
      console.log('No Q&A files found in directory');
      return;
    }

    const processingResults = await Promise.all(
      files.map(f => processQnAFile(path.join(QAPARTIALS_DIR, f)))
    );

    const successCount = processingResults.filter(Boolean).length;
    console.log(`Processed ${successCount}/${files.length} files successfully`);

  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Execute with enhanced monitoring
main()
  .then(() => console.log('Processing complete'))
  .catch(err => console.error('Unhandled error:', err));
