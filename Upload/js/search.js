// File: /js/search.js
/********************************************
 * Description: 
 *   - Filters categories and Q&A blocks as the user types.
 *   - Highlights matched words in both the category nav and Q&A areas.
 *   - Auto-labels each matching Q&A block (“Result 1”, “Result 2”, etc.).
 *   - If no match is found, it hides both zones and displays a custom "No results found" message.
 *   - Caches original HTML in dataset attributes and uses debounce for high-performance live search.
 ********************************************/

// Inject all necessary CSS (including styling for highlights and the large "no results" message)
function injectSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .category-hidden { display: none !important; }
    .qa-hidden { opacity: 0; height: 0; overflow: hidden; transition: all 0.3s ease; }
    .search-highlight { background-color: #fff3d6; padding: 2px 5px; border-radius: 3px; }
    .search-results-count { 
      color: #394464; 
      font-weight: bold; 
      margin: 15px 0; 
      display: none; 
    }
    .result-label {
      background-color: #e7f3fe;
      color: #31708f;
      font-weight: bold;
      padding: 5px 10px;
      margin-bottom: 5px;
      border-radius: 3px;
    }
    .search-no-results {
      color: #d9534f;
      font-style: italic;
      font-size: 2em;
      text-align: center;
      padding: 20px;
    }
    .active-category { border-color: #007bff !important; box-shadow: 0 2px 8px rgba(0,123,255,0.2); }
  `;
  document.head.appendChild(style);
}

// Helper: escape regex special characters to safely create a RegExp from the search term.
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Debounce helper to improve performance: delays handling until the user stops typing.
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Helper: applies highlighting to an element’s innerHTML. 
// It stores the original HTML in a data-original attribute on first use.
function applyHighlight(el, term) {
  if (!el.dataset.original) {
    el.dataset.original = el.innerHTML;
  }
  if (!term) {
    el.innerHTML = el.dataset.original;
    return;
  }
  const regex = new RegExp(escapeRegExp(term), 'gi');
  el.innerHTML = el.dataset.original.replace(regex, '<mark class="search-highlight">$&</mark>');
}

// Main search function. It requires the helper function generateCategoryLinkText (from categoryManager.js) to map IDs to names.
function handleSearch(generateCategoryLinkText) {
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce(function(e) {
    const term = e.target.value.trim();
    const lowerTerm = term.toLowerCase();
    let matchCount = 0;

    // --- Process Category Navigation ---
    const categoryGroups = document.querySelectorAll('.category-group');
    categoryGroups.forEach(group => {
      const groupHeader = group.querySelector('h3');
      let groupMatches = false;
      const items = group.querySelectorAll('.category-item');
      items.forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;
        if (!link.dataset.original) {
          link.dataset.original = link.textContent;
        }
        const textLower = link.dataset.original.toLowerCase();
        if (textLower.includes(lowerTerm) || (groupHeader && groupHeader.textContent.toLowerCase().includes(lowerTerm))) {
          item.style.display = 'block';
          groupMatches = true;
          // Highlight matching words in the navigation link.
          const regex = new RegExp(escapeRegExp(term), 'gi');
          link.innerHTML = link.dataset.original.replace(regex, '<mark class="search-highlight">$&</mark>');
        } else {
          item.style.display = 'none';
          link.innerHTML = link.dataset.original;
        }
      });
      group.style.display = groupMatches ? 'block' : 'none';
    });

    // --- Process Q&A Blocks ---
    const qaBlocks = document.querySelectorAll('.mb-8');
    qaBlocks.forEach(block => {
      if (!block.dataset.original) {
        block.dataset.original = block.innerHTML;
      }
      const header = block.querySelector('h3');
      let categoryMatch = false;
      if (header && header.id) {
        const catText = generateCategoryLinkText(header.id);
        categoryMatch = catText.toLowerCase().includes(lowerTerm);
      }
      const contentMatch = block.dataset.original.toLowerCase().includes(lowerTerm);
      if ((categoryMatch || contentMatch) && term !== "") {
        block.classList.remove('qa-hidden');
        // Highlight the matched word inside the Q&A content.
        const regex = new RegExp(escapeRegExp(term), 'gi');
        block.innerHTML = block.dataset.original.replace(regex, '<mark class="search-highlight">$&</mark>');
        matchCount++;
      } else if (term === "") {
        block.classList.remove('qa-hidden');
        block.innerHTML = block.dataset.original;
      } else {
        block.classList.add('qa-hidden');
      }
    });

    // --- Auto-label Visible Q&A Blocks ---
    const visibleBlocks = document.querySelectorAll('.mb-8:not(.qa-hidden)');
    // Remove any existing result labels.
    visibleBlocks.forEach(block => {
      const existingLabel = block.querySelector('.result-label');
      if (existingLabel) {
        existingLabel.remove();
      }
    });
    if (visibleBlocks.length > 0 && term !== "") {
      let count = 1;
      visibleBlocks.forEach(block => {
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = 'Result ' + count++;
        block.insertBefore(label, block.firstChild);
      });
    }

    // --- Update Display for Entire Zones Based on Matches ---
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    const navContainer = document.querySelector('.categories-container');
    const noResultsId = 'no-results-message';
    if (term !== "" && matchCount === 0) {
      // No matching Q&A blocks: hide both category navigation and Q&A section.
      if (qaContainer) qaContainer.style.display = 'none';
      if (navContainer) navContainer.style.display = 'none';
      // Create or update a prominent "No results found" message.
      let noResultsEl = document.getElementById(noResultsId);
      if (!noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.id = noResultsId;
        noResultsEl.className = 'search-no-results';
        // Insert the message into the parent of the navigation container.
        navContainer.parentNode.insertBefore(noResultsEl, navContainer);
      }
      noResultsEl.textContent = `No results found for "${term}". Please try a different search.`;
    } else {
      // Restore display of the standard zones.
      if (qaContainer) qaContainer.style.display = '';
      if (navContainer) navContainer.style.display = '';
      // Remove the "No results found" message if it exists.
      const noResultsEl = document.getElementById(noResultsId);
      if (noResultsEl) {
        noResultsEl.remove();
      }
    }

    // --- (Optional) Update a Results Counter If Present ---
    const countElement = document.querySelector('.search-results-count');
    if (countElement) {
      if (term) {
        if (matchCount > 0) {
          countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
          countElement.classList.remove('search-no-results');
        } else {
          countElement.textContent = `No results found for "${term}".`;
          countElement.classList.add('search-no-results');
        }
        countElement.style.display = 'block';
      } else {
        countElement.style.display = 'none';
      }
    }
  }, 300)); // 300ms debounce delay for rapid input responsiveness.
}

// Initialize the search module. This function will be called from categoryManager.js
function initializeSearch(generateCategoryLinkText) {
  injectSearchStyles();
  handleSearch(generateCategoryLinkText);
}

// Expose the initializeSearch function globally so that categoryManager.js can invoke it on DOMContentLoaded.
window.initializeSearch = initializeSearch;
