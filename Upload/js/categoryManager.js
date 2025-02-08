/********************************************
 * File: /js/categoryManager.js
 * Description: 
 *   Centralizes the categories configuration,
 *   dynamically builds the category navigation, and 
 *   groups Q&A blocks on the page.
 ********************************************/

// Central configuration for categories.
const categoriesConfig = {
  face: {
    displayName: 'Face',
    ids: ["rhinoplasty", "facelift", "eyelidlift"]
  },
  breast: {
    displayName: 'Breast',
    ids: ["breastpsycho", "lollipoptechnique", "miniinvasivebreast", "breastaugmentation"]
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

// Helper: Returns friendly link text for a given category id.
function generateCategoryLinkText(id) {
  const texts = {
    rhinoplasty: "Rhinoplasty",
    facelift: "Facelift",
    eyelidlift: "Eyelid Lift",
    breastpsycho: "Breast: Thinking all night",
    lollipoptechnique: "Breast Reduction: Lollipop technique",
    miniinvasivebreast: "Thinking about mini invasive",
    breastaugmentation: "Breast Augmentation",
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

// ----------------------------------------------------------------------
// Generate dynamic category navigation
// ----------------------------------------------------------------------
function generateCategoryNav() {
  const navContainer = document.querySelector('.categories-container .categories');
  if (!navContainer) return;

  // Apply grid layout for responsive navigation.
  navContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    gap: 15px;
  `;

  // Loop through each defined category group.
  Object.keys(categoriesConfig).forEach(groupKey => {
    const group = categoriesConfig[groupKey];
    const groupDiv = document.createElement('div');
    groupDiv.className = 'category-group';
    // Group container styling.
    groupDiv.style.cssText = `
      background-color: #ffffff;
      border: 2px solid #ffa500;
      border-radius: 8px;
      padding: 15px;
      break-inside: avoid;
    `;

    // Create and style the group header.
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

    // Build category items for the group.
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

      // Add hover effects.
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

// ----------------------------------------------------------------------
// Group Q&A blocks based on category ID.
// Assumes each Q&A partial (auto‑generated) has an outer container with class "mb-8"
// and contains a header <h3> element with an id equal to the category id.
// ----------------------------------------------------------------------
function groupQABlocks() {
  // Build a reverse mapping: category id => group key.
  const reverseMapping = {};
  Object.keys(categoriesConfig).forEach(groupKey => {
    categoriesConfig[groupKey].ids.forEach(id => {
      reverseMapping[id] = groupKey;
    });
  });

  // Get all Q&A blocks (partials) with the class "mb-8".
  const qaBlocks = document.querySelectorAll('.mb-8');
  // Selector for Q&A container that wraps all Q&A blocks.
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (!qaContainer) {
    console.error('Q&A container not found.');
    return;
  }

  // Group blocks by their category based on the id of the first <h3> with an id.
  const groupedQA = {};
  qaBlocks.forEach(block => {
    // Search for a header element bearing an id.
    const header = block.querySelector('h3[id]');
    if (header) {
      const catId = header.id;
      const groupKey = reverseMapping[catId];
      if (groupKey) {
        if (!groupedQA[groupKey]) groupedQA[groupKey] = [];
        groupedQA[groupKey].push(block);
      } else {
        console.warn(`No group mapping found for header id "${catId}".`);
      }
    } else {
      console.warn('Q&A block missing header with id:', block);
    }
  });

  // Clear out the container before appending grouped Q&A blocks.
  qaContainer.innerHTML = '';
  // Append grouped blocks in the order defined in categoriesConfig.
  Object.keys(categoriesConfig).forEach(groupKey => {
    const group = categoriesConfig[groupKey];
    if (groupedQA[groupKey] && groupedQA[groupKey].length) {
      // Create group header for the Q&A blocks.
      const groupHeader = document.createElement('h3');
      groupHeader.textContent = group.displayName;
      groupHeader.style.cssText = 'margin-top: 30px; margin-bottom: 10px;';
      qaContainer.appendChild(groupHeader);

      // Append each Q&A block from the group.
      groupedQA[groupKey].forEach(block => {
        qaContainer.appendChild(block);
      });

      // Optionally, append a horizontal separator after each group.
      const hr = document.createElement('hr');
      qaContainer.appendChild(hr);
    }
  });
}

// ----------------------------------------------------------------------
// Handle responsive grid layout for categories navigation.
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// Initialize everything once the DOM is fully loaded.
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  generateCategoryNav();
  groupQABlocks();
  handleResponsiveDesign();
});
