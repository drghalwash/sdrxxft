/********************************************
 * File: /js/categoryManager.js
 * Description: Centralizes the categories configuration,
 * dynamically builds the category navigation, and groups Q&A blocks.
 ********************************************/

// Central configuration for categories.
const categoriesConfig = {
  face: {
    displayName: 'Face',
  },
  breast: {
    displayName: 'Breast'
  },
  body: {
    displayName: 'Body'
  },
  minimally_invasive: {
    displayName: 'Minimally Invasive'
  },
  other: {
    displayName: 'Other'
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


    navContainer.appendChild(groupDiv);
  });
}


// Group Q&A blocks based on category ID.
// Assumes each Q&A block (partial) has the .mb-8 class and a child header with an id.
function groupQABlocks() {

  // Find all Q&A partial blocks.
  const qaBlocks = document.querySelectorAll('.mb-8');
  // The container that wraps the Q&A blocks (adjust selector as needed).
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (!qaContainer) {
    console.error('Q&A container not found.');
    return;
  }

  // Clear out the container before re-adding grouped content.
  qaContainer.innerHTML = '';

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
