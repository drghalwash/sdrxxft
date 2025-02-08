// File: /js/categoryManager.js
// Description: Dynamically builds category navigation and groups Q&A blocks on the Q&A page.

import { categoriesConfig, generateCategoryLinkText } from './categoryConfig.js';

// ----------------------------------------------------------------------
// Generate dynamic category navigation using the centralized config
// ----------------------------------------------------------------------
function generateCategoryNav() {
  const navContainer = document.querySelector('.categories-container .categories');
  if (!navContainer) return;

  // Set up a responsive grid layout.
  navContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, minmax(200px, 1fr));
    gap: 15px;
  `;

  // Loop through each category group defined in the config.
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

    // Build each category item and attach hover effects.
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

// ----------------------------------------------------------------------
// Group Q&A blocks based on category id in the header element.
// Each auto‑generated Q&A partial should have an outer container with class "mb-8"
// and an <h3> header with its id set to the category id.
// ----------------------------------------------------------------------
function groupQABlocks() {
  // Build a reverse mapping: category id => group key.
  const reverseMapping = {};
  Object.keys(categoriesConfig).forEach(groupKey => {
    categoriesConfig[groupKey].ids.forEach(id => {
      reverseMapping[id] = groupKey;
    });
  });

  // Select all Q&A blocks and the Q&A container.
  const qaBlocks = document.querySelectorAll('.mb-8');
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (!qaContainer) {
    console.error('Q&A container not found.');
    return;
  }

  const groupedQA = {};
  qaBlocks.forEach(block => {
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
      console.warn('Q&A block missing a header with an id:', block);
    }
  });

  // Clear the container and re-append grouped Q&A blocks.
  qaContainer.innerHTML = '';
  Object.keys(categoriesConfig).forEach(groupKey => {
    const group = categoriesConfig[groupKey];
    if (groupedQA[groupKey] && groupedQA[groupKey].length) {
      const groupHeader = document.createElement('h3');
      groupHeader.textContent = group.displayName;
      groupHeader.style.cssText = 'margin-top: 30px; margin-bottom: 10px;';
      qaContainer.appendChild(groupHeader);

      groupedQA[groupKey].forEach(block => {
        qaContainer.appendChild(block);
      });
      qaContainer.appendChild(document.createElement('hr'));
    }
  });
}

// ----------------------------------------------------------------------
// Adjust the responsive grid layout of the navigation on window resize.
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
