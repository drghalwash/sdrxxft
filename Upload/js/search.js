/********************************************
 * File: /js/search.js
 * Description: This module handles all search functionality:
 *  - Filters both category navigation and Q&A blocks based on the search term.
 *  - Highlights each occurrence of the searched term within the found content.
 *  - Auto-labels each matching Q&A block with “Result 1”, “Result 2”, etc.
 *  - When no matches are found, replaces the entire category navigation and Q&A zones
 *    with a “No results found for 'search-term'” message.
 *  - All required CSS is injected dynamically.
 ********************************************/

/** Helper: Escape special regex characters in a string */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Inject inline CSS required for search highlighting and no-results message */
function injectSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .category-hidden { display: none !important; }
    .qa-hidden { opacity: 0; height: 0; overflow: hidden; transition: all 0.3s ease; }
    .search-highlight {
      background-color: #fff3d6;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .result-label {
      background-color: #e7f3fe;
      color: #31708f;
      font-weight: bold;
      padding: 5px 10px;
      margin-bottom: 5px;
      border-radius: 3px;
    }
    .no-search-results {
      font-size: 1.2em;
      color: #d9534f;
      text-align: center;
      padding: 20px;
      font-weight: bold;
    }
    .search-results-count { 
      color: #394464; 
      font-weight: bold; 
      margin: 15px 0; 
      display: none; 
    }
    .active-category { border-color: #007bff !important; box-shadow: 0 2px 8px rgba(0,123,255,0.2); }
  `;
  document.head.appendChild(style);
}

/** 
 * Highlight the search term within a given element.
 * Uses the cached original (stored in dataset.originalHtml) so that highlights aren’t nested.
 */
function highlightContent(element, term) {
  if (!term) return;  
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  // Get the pristine HTML stored during initialization
  let original = element.dataset.originalHtml || element.innerHTML;
  element.innerHTML = original.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/** 
 * Initialize search functionality.
 * Caches the original HTML of the category navigation container,
 * the Q&A container, and each individual Q&A block and category link.
 * The generateCategoryLinkText helper (from categoryManager.js) is passed in.
 */
function initializeSearch(generateCategoryLinkText) {
  injectSearchStyles();

  // Cache original HTML for the categories container and Q&A container (so we can restore later)
  const categoryContainer = document.querySelector('.categories-container');
  if (categoryContainer && !categoryContainer.dataset.originalHtml) {
    categoryContainer.dataset.originalHtml = categoryContainer.innerHTML;
  }
  const qaContainer = document.querySelector('.bsb-faq-3 .row');
  if (qaContainer && !qaContainer.dataset.originalHtml) {
    qaContainer.dataset.originalHtml = qaContainer.innerHTML;
  }

  // Cache each Q&A block's original HTML so we can re-highlight cleanly.
  document.querySelectorAll('.mb-8').forEach(block => {
    if (!block.dataset.originalHtml) {
      block.dataset.originalHtml = block.innerHTML;
    }
  });
  // Cache original text for each category link in the navigation.
  document.querySelectorAll('.category-item a').forEach(link => {
    if (!link.dataset.originalText) {
      link.dataset.originalText = link.textContent;
    }
  });

  /** Core search handler */
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function(e) {
    // Obtain the search term in lowercase and escape spaces
    const term = e.target.value.trim().toLowerCase();
    // Reset results counter
    let matchCount = 0;
    
    // --- Process Categories Navigation ---
    document.querySelectorAll('.category-group').forEach(group => {
      const groupHeader = group.querySelector('h3');
      const groupName = groupHeader.textContent.toLowerCase();
      let hasVisibleItems = false;
      
      group.querySelectorAll('.category-item').forEach(item => {
        const link = item.querySelector('a');
        // Use cached original text for the link
        const originalText = link.dataset.originalText;
        const isMatch = originalText.toLowerCase().includes(term) || groupName.includes(term);
        // Update the anchor's inner HTML with highlighted search term if a match exists
        if (term && isMatch) {
          link.innerHTML = originalText.replace(new RegExp(`(${escapeRegExp(term)})`, 'gi'), '<mark class="search-highlight">$1</mark>');
        } else {
          link.innerHTML = originalText;
        }
        // Show or hide the item based on match
        item.style.display = isMatch || term === "" ? 'block' : 'none';
        if (isMatch) hasVisibleItems = true;
      });
      // Show group if any item is visible; otherwise hide it.
      group.style.display = hasVisibleItems ? 'block' : 'none';
    });

    // --- Process Q&A Blocks ---
    document.querySelectorAll('.mb-8').forEach(block => {
      // Restore block HTML to its original (removing previous highlights)
      block.innerHTML = block.dataset.originalHtml;
      const header = block.querySelector('h3');
      const headerText = header ? generateCategoryLinkText(header.id).toLowerCase() : "";
      // Check for match in header text or anywhere in block text
      const contentText = block.textContent.toLowerCase();
      const isMatch = (headerText.includes(term) || contentText.includes(term)) && term !== "";
      
      if (term === "") {
        // If search is cleared, show all blocks
        block.classList.remove('qa-hidden');
      } else if (isMatch) {
        block.classList.remove('qa-hidden');
        // Highlight the search term within the block
        highlightContent(block, term);
        matchCount++;
      } else {
        block.classList.add('qa-hidden');
      }
    });
    
    // --- Auto Label Matching Q&A Blocks ---
    if (term !== "" && matchCount > 0) {
      const visibleBlocks = document.querySelectorAll('.mb-8:not(.qa-hidden)');
      // Remove any pre-existing result labels then add the new ones
      visibleBlocks.forEach((block, index) => {
        const prevLabel = block.querySelector('.result-label');
        if (prevLabel) prevLabel.remove();
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = 'Result ' + (index + 1);
        block.insertBefore(label, block.firstChild);
      });
    }

    // --- Display Search Results Counter (if needed) ---
    const countElement = document.querySelector('.search-results-count');
    if (countElement) {
      if (term !== "") {
        if (matchCount > 0) {
          countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
          countElement.style.display = 'block';
        } else {
          countElement.textContent = '';
          countElement.style.display = 'none';
        }
      } else {
        countElement.style.display = 'none';
      }
    }
    
    // --- Replace Entire Zones with "No Results" Message if No Matches ---
    const categoryContainer = document.querySelector('.categories-container');
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (term !== "" && matchCount === 0) {
      const noMessageHTML = `<div class="no-search-results">No results found for "${term}"</div>`;
      if (categoryContainer) categoryContainer.innerHTML = noMessageHTML;
      if (qaContainer) qaContainer.innerHTML = noMessageHTML;
    } else if (term === "") {
      // When the search term is cleared, restore the originally generated content
      if (categoryContainer && categoryContainer.dataset.originalHtml) {
        categoryContainer.innerHTML = categoryContainer.dataset.originalHtml;
      }
      if (qaContainer && qaContainer.dataset.originalHtml) {
        qaContainer.innerHTML = qaContainer.dataset.originalHtml;
      }
    }
  });
}

// Expose the initializeSearch function so that categoryManager.js can call it on DOMContentLoaded.
window.initializeSearch = initializeSearch;
