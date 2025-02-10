// File: /js/search.js
/********************************************
 * Ultra-Super-Smartly Detailed Search
 ********************************************/

// Configuration Constants
const DEBOUNCE_DELAY = 300;
const HIGHLIGHT_CLASS = 'search-highlight';
const NO_RESULTS_CLASS = 'search-no-results';
const MIN_SEARCH_LENGTH = 2;
const MAX_HIGHLIGHT_LENGTH = 150;
const SECTION_FADE_DURATION = '0.3s';

// Globals for Performance and Safety
let searchDebounceTimer;
let previousSearchTerm = '';
let domObserver = null;

// Style Injection with Enhanced Reset
function injectSearchStyles() {
  if (document.getElementById('search-styles')) return;

  const style = document.createElement('style');
  style.id = 'search-styles';
  style.textContent = `
    .category-hidden { 
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .qa-hidden {
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      transition: opacity ${SECTION_FADE_DURATION} ease, 
                  height ${SECTION_FADE_DURATION} ease !important;
      pointer-events: none !important;
      display: none !important;
    }
    .search-highlight {
      background-color: #fff3d6 !important;
      padding: 2px 5px !important;
      border-radius: 3px !important;
      font-weight: bold !important;
    }
    .search-no-results {
      text-align: center !important;
      padding: 40px 20px !important;
      font-size: 1.5em !important;
      color: #d9534f !important;
    }
    .search-loading {
      /* Add your loading indicator styles here */
    }
  `;
  document.head.appendChild(style);
}

// Secure HTML Sanitization
function sanitizeHTML(text) {
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.innerHTML;
}

// Optimized Highlighting
function highlightTerms(text, term) {
  if (!term || typeof text !== 'string') return sanitizeHTML(text);

  const safeTerm = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${safeTerm})`, 'gi');
  let matchCount = 0;

  return text.replace(regex, (match) => {
    if (text.length > MAX_HIGHLIGHT_LENGTH || matchCount > 5) return sanitizeHTML(match);
    matchCount++;
    return `<span class="${HIGHLIGHT_CLASS}">${sanitizeHTML(match)}</span>`;
  });
}

// DOM Observer Setup
function observeDOMChanges(generateCategoryLinkText) {
  if (domObserver) domObserver.disconnect();

  const targetNode = document.querySelector('.bsb-faq-3') || document.body;
  if (!targetNode) return;

  const config = { 
    childList: true, 
    subtree: true, 
    characterData: true,
    attributes: true // Include attribute changes
  };

  domObserver = new MutationObserver((mutationsList) => {
    const searchTerm = document.getElementById('categorySearch')?.value.trim().toLowerCase() || '';
    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      performSearch(searchTerm, generateCategoryLinkText);
    }
  });

  domObserver.observe(targetNode, config);
}

// Search Handling
function handleSearch(generateCategoryLinkText) {
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) {
    console.error('Search input missing.');
    return;
  }

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (term === previousSearchTerm) return;
    previousSearchTerm = term;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(term, generateCategoryLinkText);
    }, DEBOUNCE_DELAY);
  });

  observeDOMChanges(generateCategoryLinkText);
}

// Core Search Logic
function performSearch(term, generateCategoryLinkText) {
  if (term.length < MIN_SEARCH_LENGTH) {
    resetDisplay();
    return;
  }

  resetDisplay();
  const results = filterAndHighlight(term, generateCategoryLinkText);
  updateVisibility(term, results);
}

// Visibility Handling
function updateVisibility(term, results) {
  const categoriesSection = document.querySelector('.categories-container');
  const faqSection = document.querySelector('.bsb-faq-3');

  if (term && results.categories === 0 && results.qaBlocks === 0) {
    hideSections(term, categoriesSection, faqSection);
  } else {
    showSections(categoriesSection, faqSection);
  }
}

// Section Hiding
function hideSections(term, categoriesSection, faqSection) {
  displayNoResultsMessage(term);

  if (categoriesSection) {
    categoriesSection.style.transition = `opacity ${SECTION_FADE_DURATION} ease, height ${SECTION_FADE_DURATION} ease`;
    categoriesSection.style.opacity = '0';
    categoriesSection.style.height = '0';
    setTimeout(() => { categoriesSection.style.display = 'none'; }, parseInt(SECTION_FADE_DURATION) * 1000);
  }

  if (faqSection) {
    faqSection.style.transition = `opacity ${SECTION_FADE_DURATION} ease, height ${SECTION_FADE_DURATION} ease`;
    faqSection.style.opacity = '0';
    faqSection.style.height = '0';
    setTimeout(() => { faqSection.style.display = 'none'; }, parseInt(SECTION_FADE_DURATION) * 1000);
  }
}

// Section Showing
function showSections(categoriesSection, faqSection) {
  removeNoResultsMessage();

  if (categoriesSection) {
    categoriesSection.style.display = '';
    categoriesSection.style.opacity = '1';
    categoriesSection.style.height = 'auto';
  }

  if (faqSection) {
    faqSection.style.display = '';
    faqSection.style.opacity = '1';
    faqSection.style.height = 'auto';
  }
}

// Add and Remove Message with Safety
function displayNoResultsMessage(term) {
  removeNoResultsMessage();
  const parent = document.querySelector('.categories-container')?.parentNode || document.body;
  const message = document.createElement('div');
  message.className = NO_RESULTS_CLASS;
  message.innerHTML = `No results found for "${sanitizeHTML(term)}".`;
  parent.insertBefore(message, parent.firstChild);
}

function removeNoResultsMessage() {
  const message = document.querySelector(`.${NO_RESULTS_CLASS}`);
  message?.remove();
}

// Reset Display Settings
function resetDisplay() {
  document.querySelectorAll('.category-group, .mb-8').forEach(el => {
    el.classList.remove('category-hidden', 'qa-hidden');
    el.style.display = '';
    el.style.opacity = '';
    el.style.height = '';
    el.innerHTML = el.innerHTML.replace(new RegExp(`<span class="${HIGHLIGHT_CLASS}">(.*?)<\/span>`, 'gi'), '$1');
  });
  removeNoResultsMessage();
}

// Filter and Highlight Content
function filterAndHighlight(term, generateCategoryLinkText) {
  const results = { categories: 0, qaBlocks: 0 };

  // Categories
  document.querySelectorAll('.category-group').forEach(group => {
    const groupName = group.querySelector('h3')?.textContent.toLowerCase() || '';
    let hasVisibleItems = false;

    group.querySelectorAll('.category-item').forEach(item => {
      const itemText = item.textContent.toLowerCase();
      const isMatch = !term || itemText.includes(term) || groupName.includes(term);
      item.classList.toggle('category-hidden', !isMatch);
      item.style.display = isMatch ? '' : 'none';
      if (isMatch) hasVisibleItems = true;
    });

    group.classList.toggle('category-hidden', !hasVisibleItems);
    group.style.display = hasVisibleItems ? '' : 'none';
    if (hasVisibleItems) results.categories++;
  });

  // Q&A Blocks
  document.querySelectorAll('.mb-8').forEach(block => {
    let categoryMatch = false;
    const header = block.querySelector('h3');
    const categoryId = header?.id;

    if (categoryId) {
      categoryMatch = generateCategoryLinkText(categoryId).toLowerCase().includes(term);
    }

    const contentMatch = block.textContent.toLowerCase().includes(term);
    const shouldShow = (categoryMatch || contentMatch) && term;

    block.classList.toggle('qa-hidden', !shouldShow);
    block.style.display = shouldShow ? '' : 'none';

    if (shouldShow) {
      block.innerHTML = highlightTerms(block.innerHTML, term);
      results.qaBlocks++;
    }
  });

  return results;
}

// Initialization
function initializeSearch(generateCategoryLinkText) {
  try {
    injectSearchStyles();
    handleSearch(generateCategoryLinkText);
  } catch (err) {
    console.error("Search init failed:", err);
  }
}

window.initializeSearch = initializeSearch;
