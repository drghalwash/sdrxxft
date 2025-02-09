// File: /js/
// Description:
//   • Uses the global 'categoriesConfig' (from your categoryManager.js) to know which category IDs exist.
//   • For each category id, it fetches /Qapartials/<categoryid>.txt; if missing or malformed it skips it.
//   • Parses the file expecting first two header lines ("##CATEGORY_ID=…" and "##TITLE=…")
//     then numbered Q&A lines (e.g., "1. Question") followed by answer text.
//   • Generates a Bootstrap accordion wrapped in a layout container.
//   • Injects all generated content into a placeholder container on your Q&A page.

(async () => {
  // Locate the container in your page where generated Q&A blocks will be injected.
  const container = document.querySelector('.qna-partials-container');
  if (!container) {
    return console.error("Missing '.qna-partials-container' element in the template.");
  }

  // Gather category IDs from the centralized config (categoriesConfig should be defined globally)
  const categoryIds = [];
  Object.values(categoriesConfig).forEach(group => {
    if(Array.isArray(group.ids)) {
      categoryIds.push(...group.ids);
    }
  });

  // Utility: Build accordion HTML from Q&A pairs
  const buildAccordion = (categoryid, qnaPairs) => {
    let acc = `<div class="custom-accordion" id="accordion_${categoryid}">`;
    qnaPairs.forEach((pair, idx) => {
      const isFirst = idx === 0;
      acc += `
      <div class="accordion-item">
        <h2 class="mb-0">
          <button class="btn btn-link${isFirst ? '' : ' collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${categoryid}_q${idx+1}" aria-expanded="${isFirst}" aria-controls="${categoryid}_q${idx+1}">
            ${pair.question.trim()}
          </button>
        </h2>
        <div id="${categoryid}_q${idx+1}" class="accordion-collapse collapse${isFirst ? ' show' : ''}" data-bs-parent="#accordion_${categoryid}">
          <div class="accordion-body">
            <p class="answer">${pair.answer.trim()}</p>
          </div>
        </div>
      </div>`;
    });
    acc += `</div>`;
    return acc;
  };

  // Loop through each category id, fetching and processing its Q&A file
  for (let catId of categoryIds) {
    try {
      const res = await fetch(`/Qapartials/${catId}.txt`);
      if (!res.ok) {
        console.warn(`Skipping "${catId}": file not found.`);
        continue;
      }
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      // Validate that the file contains at least two header lines
      if (lines.length < 3 || !lines[0].startsWith("##CATEGORY_ID=") || !lines[1].startsWith("##TITLE=")) {
        console.warn(`Skipping "${catId}": Invalid header format.`);
        continue;
      }
      const fileCatid = lines[0].split('=')[1].trim();
      const title = lines[1].split('=')[1].trim();

      // Parse the Q&A pairs (lines starting at index 2)
      const qnaPairs = [];
      let current = null;
      const qRegex = /^\d+\.\s*(.+)$/;
      for (let i = 2; i < lines.length; i++) {
        const match = lines[i].match(qRegex);
        if (match) {
          if (current) {
            current.answer = current.answer.trim();
            qnaPairs.push(current);
          }
          current = { question: match[1].trim(), answer: '' };
        } else if (current) {
          current.answer += lines[i] + ' ';
        }
      }
      if (current) {
        current.answer = current.answer.trim();
        qnaPairs.push(current);
      }
      if (qnaPairs.length === 0) {
        console.warn(`Skipping "${catId}": No Q&A pairs found.`);
        continue;
      }

      // Generate the accordion HTML and wrap it in your layout container
      const accordionHTML = buildAccordion(fileCatid, qnaPairs);
      const finalHTML = `<div class="mb-8">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-11 col-xl-10">
        <div class="d-flex align-items-end mb-5">
          <h3 class="m-0" id="${fileCatid}">${title}</h3>
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

      // Append the generated HTML to the container
      container.insertAdjacentHTML('beforeend', finalHTML);
    } catch (error) {
      console.error(`Error processing "${catId}": ${error.message}`);
    }
  }
})();
