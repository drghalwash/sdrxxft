// File: /public/js/categoryManager.js
document.addEventListener('DOMContentLoaded', async () => {
  /********************************************
   * Configuration and Helper Functions
   ********************************************/
  const categoriesConfig = {
    face: {
      displayName: 'Face',
      ids: ["rhinoplasty", "facelift", "eyelidlift"]
    },
    breast: {
      displayName: 'Breast',
      ids: ["breastpsycho", "lollipoptechnique", "miniinvasivebreast", "breastaugmentation", "pocketlift"]
    },
    body: {
      displayName: 'Body',
      ids: ["bodycontouring", "fatgrafting", "tummytuck", "brazilianbuttlift", "mommyMakeover"]
    },
    minimally_invasive: {
      displayName: 'Minimally Invasive',
      ids: ["botoxfillers", "noninvasivecontouring"]
    },
    other: {
      displayName: 'Other',
      ids: ["hairtransplant", "skinresurfacing"]
    }
  };

  function generateCategoryLinkText(id) {
    const texts = {
      rhinoplasty: "Rhinoplasty",
      facelift: "Facelift",
      eyelidlift: "Eyelid Lift",
      breastpsycho: "Breast: Thinking all night",
      lollipoptechnique: "Breast Reduction: Lollipop technique",
      miniinvasivebreast: "Thinking about mini invasive",
      breastaugmentation: "Breast Augmentation",
      pocketlift: "Pocket Lift",
      bodycontouring: "Body Contouring",
      fatgrafting: "Fat Grafting",
      tummytuck: "Tummy Tuck (Abdominoplasty)",
      brazilianbuttlift: "Brazilian Butt Lift (BBL)",
      mommyMakeover: "Mommy Makeover",
      botoxfillers: "Botox & Dermal Fillers",
      noninvasivecontouring: "Non-Invasive Body Contouring",
      hairtransplant: "Hair Transplant",
      skinresurfacing: "LASER SKIN RESURFACING"
    };
    return texts[id] || id;
  }

  function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) return;

    navContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, minmax(200px, 1fr));
      gap: 15px;
    `;

    Object.keys(categoriesConfig).forEach(groupKey => {
      const group = categoriesConfig[groupKey];
      const groupDiv = document.createElement('div');
      groupDiv.className = 'category-group';
      groupDiv.style.cssText = `
        background-color: #ffffff;
        border: 2px solid #ffa500;
        border-radius: 8px;
        padding: 15px;
        break-inside: avoid;
      `;

      const header = document.createElement('h3');
      header.textContent = group.displayName;
      header.style.cssText = `
        background-color: #394464;
        color: white;
        font-family: Verdana, sans-serif;
        font-weight: bold;
        font-size: 1.1em;
        padding: 8px 15px;
        margin-bottom: 15px;
        border-radius: 0 20px 20px 0;
      `;
      groupDiv.appendChild(header);

      group.ids.forEach(id => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'category-item';
        itemDiv.style.cssText = 'padding: 5px 0;';

        const aElem = document.createElement('a');
        aElem.href = `#${id}`;
        aElem.textContent = generateCategoryLinkText(id);
        aElem.style.cssText = `
          color: #495057;
          text-decoration: none;
          font-family: Verdana, sans-serif;
          font-size: 0.95em;
          transition: color 0.3s ease;
        `;

        aElem.addEventListener('mouseenter', () => {
          aElem.style.color = '#007bff';
          aElem.style.fontWeight = 'bold';
        });
        aElem.addEventListener('mouseleave', () => {
          aElem.style.color = '#495057';
          aElem.style.fontWeight = 'normal';
        });

        itemDiv.appendChild(aElem);
        groupDiv.appendChild(itemDiv);
      });

      navContainer.appendChild(groupDiv);
    });
  }

  function handleResponsiveDesign() {
    const categories = document.querySelector('.categories');
    if (!categories) return;

    const updateGrid = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        categories.style.gridTemplateColumns = 'repeat(1, minmax(200px, auto))';
      } else if (width <= 768) {
        categories.style.gridTemplateColumns = 'repeat(2, minmax(200px, auto))';
      } else if (width <= 1200) {
        categories.style.gridTemplateColumns = 'repeat(3, minmax(200px, auto))';
      } else {
        categories.style.gridTemplateColumns = 'repeat(4, minmax(200px, auto))';
      }
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
  }

  /********************************************
   * Q&A Loading and Rendering
   ********************************************/
  async function loadAndRenderQA() {
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (!qaContainer) {
      console.error('Q&A container not found.');
      return;
    }

    // Load Handlebars from CDN if not already available
    if (typeof Handlebars === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js';
      script.onload = renderQA;
      document.head.appendChild(script);
    } else {
      renderQA();
    }

    async function renderQA() {
      let allQAContent = '';
      for (const groupKey in categoriesConfig) {
        const group = categoriesConfig[groupKey];
        for (const categoryId of group.ids) {
          try {
            const response = await fetch(`/Qapartials/${groupKey}.txt`); // Load group file
            if (!response.ok) continue;

            const text = await response.text();
            const categoryRegex = new RegExp(`##CATEGORY_ID=${categoryId}\\s*##TITLE=(.*?)\\s*(.*?)(?=(##CATEGORY_ID)|$)`, 'gs');
            let match = categoryRegex.exec(text);

            if (match) {
              const title = match[1].trim();
              const qaContent = match[2].trim();

              // Parse Q&A pairs
              const qnaPairs = [];
              let currentPair = null;
              const questionRegex = /^\d+\.\s+(.*)$/m; // Multi-line

              qaContent.split('\n').forEach(line => {
                const questionMatch = line.match(questionRegex);
                if (questionMatch) {
                  if (currentPair) qnaPairs.push(currentPair);
                  currentPair = { question: questionMatch[1].trim(), answer: '' };
                } else if (currentPair) {
                  currentPair.answer += line + ' ';
                }
              });
              if (currentPair) qnaPairs.push(currentPair);

              // Handlebars template
              const source = `
                <div class="mb-8" id="${categoryId}">
                  <h3>{{title}}</h3>
                  <div class="accordion" id="accordion_${categoryId}">
                    {{#each qnaPairs}}
                    <div class="accordion-item">
                      <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${categoryId}_q{{@index}}" aria-expanded="false">
                          {{this.question}}
                        </button>
                      </h2>
                      <div id="${categoryId}_q{{@index}}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                          {{this.answer}}
                        </div>
                      </div>
                    </div>
                    {{/each}}
                  </div>
                </div>
              `;

              // Compile the template
              const template = Handlebars.compile(source);

              // Generate HTML
              const html = template({ categoryId: categoryId, title: title, qnaPairs: qnaPairs });
              allQAContent += html;
            }

          } catch (error) {
            console.error(`Error processing ${categoryId}:`, error);
          }
        }
      }
      qaContainer.innerHTML = allQAContent;
      groupQABlocks(); // Ensure Q&A blocks are grouped after rendering
    }
  }

  /********************************************
   * Initialization
   ********************************************/
  generateCategoryNav();
  handleResponsiveDesign();
  await loadAndRenderQA(); // Load and render Q&A
});
