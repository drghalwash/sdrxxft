// File: /js/search.js
/********************************************
 * File: /js/search.js
 * Description: Handles enhanced search functionality.
 * Features:
 *   - Filters both category navigation and Q&A blocks as the user types.
 *   - Highlights matching words within the found content.
 *   - Auto‑labels each matching Q&A block (“Result 1”, “Result 2”, etc.).
 *   - When no match exists, completely hides the category navigation and Q&A zones,
 *     replacing them with a large, custom “No results found…” message.
 *   - All necessary styling is injected via JavaScript.
 *   - Uses debouncing for super‑fast, performance‑optimized operation.
 ********************************************/

/* Inject inline CSS styles */
function injectSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide elements when not matching */
    .category-hidden { display: none !important; }
    .qa-hidden { opacity: 0; height: 0; overflow: hidden; transition: all 0.3s ease; }

    /* Highlight matching search terms */
    .search-highlight {
      background-color: #fff3d6;
      padding: 2px 5px;
      border-radius: 3px;
    }
    
    /* Normal search results counter style */
    .search-results-count {
      color: #394464;
      font-weight: bold;
      margin: 15px 0;
      display: none;
    }
    
    /* Auto-label on matching Q&A block */
    .result-label {
      background-color: #e7f3fe;
      color: #31708f;
      font-weight: bold;
      padding: 5px 10px;
      margin-bottom: 5px;
      border-radius: 3px;
    }
    
    /* “No results found” message styling */
    .search-no-results {
      font-size: 2rem;
      text-align: center;
      color: #d9534f;
      font-style: italic;
    }
  `;
  document.head.appendChild(style);
}

/* Helper: Debounce function for performance */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* Helper: Escape special regex characters in search term */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Helper: For a given element, store its original HTML if not already done,
   and highlight all occurrences of term (case-insensitive) */
function highlightText(element, term) {
  if (!element.dataset.originalContent) {
    element.dataset.originalContent = element.innerHTML;
  }
  // If term is empty, revert to the original content.
  if (!term) {
    element.innerHTML = element.dataset.originalContent;
    return;
  }
  const original = element.dataset.originalContent;
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  element.innerHTML = original.replace(regex, '<span class="search-highlight">$1</span>');
}

/* Core search handler.
   Expects generateCategoryLinkText (a helper from categoryManager.js) to be passed in */
function handleSearch(generateCategoryLinkText) {
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) return;
  
  // Cache selectors for the category nav and Q&A container
  const categoryContainer = document.querySelector('.categories-container');
  const qaContainer = document.querySelector('.bsb-faq-3');
  const resultsCounter = document.querySelector('.search-results-count');

  // Wrapped handler for debouncing
  searchInput.addEventListener('input', debounce(function (e) {
    const term = e.target.value.trim().toLowerCase();
    let matchCount = 0;

    // --- Filter Category Navigation Items ---
    const categoryItems = document.querySelectorAll('.categories-container .category-item');
    categoryItems.forEach(item => {
      // Save original text if not already set.
      if (!item.dataset.originalText) {
        item.dataset.originalText = item.innerHTML;
      }
      // Remove previous highlights or restore original content.
      if (!term) {
        item.innerHTML = item.dataset.originalText;
      }
      const text = item.textContent.toLowerCase();
      if (term === "" || text.indexOf(term) !== -1) {
        item.style.display = 'block';
        highlightText(item, term);
      } else {
        item.style.display = 'none';
      }
    });
    
    // --- Filter Q&A Blocks (assumed to have class "mb-8") ---
    const qaBlocks = document.querySelectorAll('.mb-8');
    qaBlocks.forEach(block => {
      // For each block, if it has a header with an id use that too.
      const header = block.querySelector('h3');
      let headerText = "";
      if (header && header.id) {
        headerText = generateCategoryLinkText(header.id).toLowerCase();
      }
      // Consider entire block text.
      const blockText = block.textContent.toLowerCase();
      // Determine if block matches if it contains the search term in header or content.
      const isMatch = term === "" || headerText.indexOf(term) !== -1 || blockText.indexOf(term) !== -1;
      if (isMatch) {
        block.classList.remove('qa-hidden');
        // Highlight the matching text inside the block.
        highlightText(block, term);
        matchCount++;
      } else {
        block.classList.add('qa-hidden');
      }
    });
    
    // --- Auto-label each visible Q&A block ---
    const visibleQABlocks = document.querySelectorAll('.mb-8:not(.qa-hidden)');
    // First remove any previous labels.
    visibleQABlocks.forEach(block => {
      const existingLabel = block.querySelector('.result-label');
      if (existingLabel) existingLabel.remove();
    });
    if (term && visibleQABlocks.length > 0) {
      let count = 1;
      visibleQABlocks.forEach(block => {
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = 'Result ' + count++;
        block.insertBefore(label, block.firstChild);
      });
    }
    
    // --- Update results counter and zones display ---
    if (term) {
      if (matchCount > 0) {
        resultsCounter.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
        resultsCounter.classList.remove('search-no-results');
        // Show both categories and Q&A zones if there are results.
        if (categoryContainer) categoryContainer.style.display = 'block';
        if (qaContainer) qaContainer.style.display = 'block';
      } else {
        resultsCounter.textContent = `No results found for "${term}"`;
        resultsCounter.classList.add('search-no-results');
        // Hide both the category navigation and Q&A zones entirely.
        if (categoryContainer) categoryContainer.style.display = 'none';
        if (qaContainer) qaContainer.style.display = 'none';
      }
      resultsCounter.style.display = 'block';
    } else {
      resultsCounter.style.display = 'none';
      // Reset: show both zones and remove highlighting.
      if (categoryContainer) categoryContainer.style.display = 'block';
      if (qaContainer) qaContainer.style.display = 'block';
      // Restore original content for Q&A blocks.
      qaBlocks.forEach(block => {
        highlightText(block, "");
      });
    }
    
  }, 200)); // 200ms debounce for speed
}

/* Initialize search functionality.
   Must be called from your main initialization (after DOMContentLoaded) */
function initializeSearch(generateCategoryLinkText) {
  injectSearchStyles();
  handleSearch(generateCategoryLinkText);
}

/* Expose initializeSearch so that it can be invoked from categoryManager.js */
window.initializeSearch = initializeSearch;
