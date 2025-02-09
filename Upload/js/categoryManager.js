/********************************************
 * File: /js/categoryManager.js
 * Description: Centralizes the categories configuration,
 * dynamically builds the category navigation, and groups Q&A blocks.
 ********************************************/

// Central configuration for categories.
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

// Helper function to get friendly display text for a category ID.
function generateCategoryLinkText(id) {
  const texts = {
    rhinoplasty: "Rhinoplasty",
    facelift: "Facelift",
    eyelidlift: "Eyelid Lift",
    breastpsycho: "Breast: Thinking all night",
    lollipoptechnique: "Breast Reduction: Lollipop technique",
    miniinvasivebreast: "Thinking about mini invasive",
    breastaugmentation: "Breast Augmentation",
    pocketlift: "Pocket Lift Breast Reduction",
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

// Generate dynamic category navigation.
// Generate dynamic category navigation with inline styling
function generateCategoryNav() {
  const navContainer = document.querySelector('.categories-container .categories');
  if (!navContainer) return;

  // Apply styles to the container (replaces CSS rules)
  navContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    gap: 15px;
  `;

  Object.keys(categoriesConfig).forEach(groupKey => {
    const group = categoriesConfig[groupKey];
    const groupDiv = document.createElement('div');
    groupDiv.className = 'category-group';
    // Apply group styles
    groupDiv.style.cssText = `
      background-color: #ffffff;
      border: 2px solid #ffa500;
      border-radius: 8px;
      padding: 15px;
      break-inside: avoid;
    `;

    const header = document.createElement('h3');
    header.textContent = group.displayName;
    // Apply header styles
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
      itemDiv.style.cssText = 'padding: 5px 0;'; // Item padding

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
      
      // Add hover effects via JavaScript instead of CSS
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


// Group Q&A blocks based on category ID.
// Assumes each Q&A block (partial) has the .mb-8 class and a child header with an id.
function groupQABlocks() {
  // Build a reverse mapping from category ID to its group key.
  const reverseMapping = {};
  Object.keys(categoriesConfig).forEach(groupKey => {
    categoriesConfig[groupKey].ids.forEach(id => {
      reverseMapping[id] = groupKey;
    });
  });

  // Find all Q&A partial blocks.
  const qaBlocks = document.querySelectorAll('.mb-8');
  // The container that wraps the Q&A blocks (adjust selector as needed).
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (!qaContainer) {
    console.error('Q&A container not found.');
    return;
  }

  // Group blocks by their category (using the header id).
  const groupedQA = {};
  qaBlocks.forEach(block => {
    const header = block.querySelector('h3');
    if (header && header.id) {
      const groupKey = reverseMapping[header.id];
      if (groupKey) {
        if (!groupedQA[groupKey]) groupedQA[groupKey] = [];
        groupedQA[groupKey].push(block);
      } else {
        console.warn(`No mapping found for block with header id "${header.id}".`);
      }
    } else {
      console.warn('Q&A block missing a header with an id.', block);
    }
  });

  // Clear out the container before re-adding grouped content.
  qaContainer.innerHTML = '';
  // Append grouped blocks following the order of the configuration.
  Object.keys(categoriesConfig).forEach(groupKey => {
    if (groupedQA[groupKey] && groupedQA[groupKey].length) {
      const groupHeader = document.createElement('h3');
      groupHeader.textContent = categoriesConfig[groupKey].displayName;
      qaContainer.appendChild(groupHeader);

      groupedQA[groupKey].forEach(block => {
        qaContainer.appendChild(block);
      });
      
      // Optionally, add a separator.
      qaContainer.appendChild(document.createElement('hr'));
    }
  });
}

// Initialize the navigation and grouping functions when the DOM is ready.
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

// Initialize in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  generateCategoryNav();
  groupQABlocks();
  handleResponsiveDesign(); // Add this line
});
