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
function generateCategoryNav() {
  // Find the container defined in your Handlebars template.
  const navContainer = document.querySelector('.categories-container .categories');
  if (!navContainer) return;

  const fragment = document.createDocumentFragment();

  // Loop over each group from the central config.
  Object.keys(categoriesConfig).forEach(groupKey => {
    const group = categoriesConfig[groupKey];
    
    // Create and append a header for the group.
    const header = document.createElement('h3');
    header.textContent = group.displayName;
    fragment.appendChild(header);

    // For each category in the group, build the nav item.
    group.ids.forEach(id => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'category-item';
      const aElem = document.createElement('a');
      aElem.href = `#${id}`;
      aElem.textContent = generateCategoryLinkText(id);
      // Optional inline style; customize as needed.
      aElem.style.cssText = 'font-weight: bold; color: #007bff;';
      itemDiv.appendChild(aElem);
      fragment.appendChild(itemDiv);
    });
    // Add a separator (optional).
    fragment.appendChild(document.createElement('hr'));
  });

  // Clear any existing content before inserting generated nav.
  navContainer.innerHTML = '';
  navContainer.appendChild(fragment);
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
document.addEventListener('DOMContentLoaded', () => {
  generateCategoryNav();
  groupQABlocks();
});
