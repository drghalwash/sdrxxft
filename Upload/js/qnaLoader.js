// File: /public/upload/js/qnaLoader.js
// Description: Loads Q&A files from /Qapartials, converts them in memory into Bootstrap accordion HTML,
//              and appends them into the designated container on your Q&A page. Only category IDs defined
//              in categoriesConfig (from categoryManager.js) that have a corresponding .txt file are used.

document.addEventListener('DOMContentLoaded', async () => {
  // Use the existing container (defined in your Questions_And_Answer.handlebars)
  // Make sure this container exists (e.g., <div class="bsb-faq-3"><div class="row"></div></div>)
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (!qaContainer) {
    console.error('Q&A container not found. Ensure Questions_And_Answer.handlebars contains a container with selector ".bsb-faq-3 .row".');
    return;
  }

  // Helper: load and process one Q&A .txt file (expects header lines: ##CATEGORY_ID= and ##TITLE=)
  async function loadQnAFromFile(id) {
    try {
      const res = await fetch(`/Qapartials/${id}.txt`);
      if (!res.ok) return null; // Skip if file doesn’t exist
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length < 2 ||
          !lines[0].startsWith('##CATEGORY_ID=') ||
          !lines[1].startsWith('##TITLE=')) {
        console.warn(`Skipping ${id}: Invalid header format.`);
        return null;
      }
      // Extract header values
      const fileCategoryId = lines[0].split('=')[1].trim();
      const title = lines[1].split('=')[1].trim();

      // Process Q&A pairs from line 3 onward.
      let qnaPairs = [];
      let currentPair = null;
      const questionRegex = /^\d+\.\s+(.*)$/;
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(questionRegex);
        if (match) {
          if (currentPair) {
            currentPair.answer = currentPair.answer.trim();
            qnaPairs.push(currentPair);
          }
          currentPair = { question: match[1].trim(), answer: '' };
        } else if (currentPair) {
          currentPair.answer += line + ' ';
        }
      }
      if (currentPair) {
        currentPair.answer = currentPair.answer.trim();
        qnaPairs.push(currentPair);
      }

      // Build the accordion HTML for these Q&A pairs
      let accordionHTML = `<div class="accordion" id="accordion_${id}">`;
      qnaPairs.forEach((pair, index) => {
        const isFirst = index === 0;
        accordionHTML += `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${id}_q${index}" aria-expanded="${isFirst}" aria-controls="${id}_q${index}">
                ${pair.question}
              </button>
            </h2>
            <div id="${id}_q${index}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" data-bs-parent="#accordion_${id}">
              <div class="accordion-body">
                ${pair.answer}
              </div>
            </div>
          </div>`;
      });
      accordionHTML += '</div>';

      // Return complete HTML block; note the outer div has class "mb-8" and its header id equals the category id.
      return `
        <div class="mb-8" id="${fileCategoryId}">
          <h3 id="${fileCategoryId}">${title}</h3>
          ${accordionHTML}
        </div>`;
    } catch (error) {
      console.error(`Error processing ${id}: ${error.message}`);
      return null;
    }
  }

  // Build list of all category IDs from your existing global categoriesConfig (from categoryManager.js)
  const categoryIds = [];
  if (window.categoriesConfig) {
    Object.values(categoriesConfig).forEach(group => {
      group.ids.forEach(id => categoryIds.push(id));
    });
  } else {
    console.warn('categoriesConfig not defined in categoryManager.js.');
  }

  // Load Q&A for each category ID (skip those with no file)
  const loadedBlocks = await Promise.all(categoryIds.map(async id => await loadQnAFromFile(id)));
  loadedBlocks.forEach(blockHTML => {
    if (blockHTML) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = blockHTML;
      qaContainer.appendChild(wrapper.firstElementChild);
    }
  });

  // After loading, re-run the grouping function from categoryManager.js if defined.
  if (typeof groupQABlocks === 'function') groupQABlocks();
});
