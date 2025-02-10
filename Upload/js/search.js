// File: /js/search.js
/********************************************
 * File: /js/search.js
 * Description: Handles search functionality:
 *  - Filters categories and Q&A blocks based on the search term.
 *  - Auto-labels each visible result (e.g., "Result 1").
 *  - Shows a custom "No results found" message when nothing matches.
 *  - Highlights the searched term within each result.
 *  - Replaces the category navigation and Q&A zones with the "No results" message.
 *  - Injects required CSS via JS.
 ********************************************/

// Inject inline CSS for search styling
function injectSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide mismatched elements */
    .category-hidden { display: none !important; }
    .qa-hidden {
      opacity: 0;
      height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    /* Highlight for potential search term wrap (if needed later) */
    .search-highlight {
      background-color: #fff3d6;
      padding: 2px 5px;
      border-radius: 3px;
    }
    /* Results counter style */
    .search-results-count {
      color: #394464;
      font-weight: bold;
      margin: 15px 0;
      display: none;
    }
    /* Label added to each found Q&A block */
    .result-label {
      background-color: #e7f3fe;
      color: #31708f;
      font-weight: bold;
      padding: 5px 10px;
      margin-bottom: 5px;
      border-radius: 3px;
    }
    /* Custom no-results message styling */
    .search-no-results {
      color: #d9534f;
      font-style: italic;
      text-align: center;
      padding: 20px;
      border: 1px solid #d9534f;
      margin: 20px auto;
      border-radius: 5px;
    }
    /* Active category styling */
    .active-category {
      border-color: #007bff !important;
      box-shadow: 0 2px 8px rgba(0,123,255,0.2);
    }
  `;
  document.head.appendChild(style);
}

// Core search handler function.
function handleSearch(generateCategoryLinkText) {
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const term = e.target.value.trim().toLowerCase();
    let matchCount = 0;

    // --- Define areas to hide/replace ---
    const categoriesContainer = document.querySelector('.categories-container');
    const qaContainer = document.querySelector('.bsb-faq-3');

    // --- Filter Category Navigation ---
    document.querySelectorAll('.category-group').forEach(group => {
      const groupName = group.querySelector('h3').textContent.toLowerCase();
      let hasVisibleItems = false;
      group.querySelectorAll('.category-item').forEach(item => {
        const itemText = item.textContent.toLowerCase();
        const isMatch = itemText.includes(term) || groupName.includes(term);
        item.style.display = isMatch ? 'block' : 'none';
        if (isMatch) hasVisibleItems = true;
      });
      group.style.display = hasVisibleItems ? 'block' : 'none';
    });

    // --- Filter Q&A Blocks ---
    document.querySelectorAll('.mb-8').forEach(block => {
      const header = block.querySelector('h3');
      let categoryMatch = false;
      if (header && header.id) {
        categoryMatch = generateCategoryLinkText(header.id).toLowerCase().includes(term);
      }
      let contentMatch = false;
      // Highlight matching term in content
      if (term) {
        const originalText = block.innerHTML;
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        const highlightedText = originalText.replace(regex, '<span class="search-highlight">$1</span>');
        block.innerHTML = highlightedText;
        contentMatch = block.textContent.toLowerCase().includes(term);
      } else {
        // If no search term, reset highlighting
        block.querySelectorAll('.search-highlight').forEach(highlight => {
          highlight.outerHTML = highlight.innerHTML;
        });
      }

      if ((categoryMatch || contentMatch) && term !== "") {
        block.classList.remove('qa-hidden');
        matchCount++;
      } else if (term === "") {
        // When search term is cleared, reset all blocks
        block.classList.remove('qa-hidden');
        block.querySelectorAll('.search-highlight').forEach(highlight => {
          highlight.outerHTML = highlight.innerHTML;
        });
      } else {
        block.classList.add('qa-hidden');
      }
    });

    // --- Auto Labeling of Visible Q&A Results ---
    const visibleBlocks = document.querySelectorAll('.mb-8:not(.qa-hidden)');
    // Remove any existing result labels
    visibleBlocks.forEach(block => {
      const prevLabel = block.querySelector('.result-label');
      if (prevLabel) {
        prevLabel.remove();
      }
    });
    // If search term is active, add a label to each visible result
    if (visibleBlocks.length > 0 && term !== "") {
      let count = 1;
      visibleBlocks.forEach(block => {
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = 'Result ' + count++;
        block.insertBefore(label, block.firstChild);
      });
    }

    // --- Handle No Results ---
    if (term) {
      if (matchCount === 0) {
        // Hide category navigation and Q&A sections
        if (categoriesContainer) categoriesContainer.style.display = 'none';
        if (qaContainer) qaContainer.style.display = 'none';

        // Display "No results" message
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'search-no-results';
        noResultsMessage.textContent = `No results found for "${term}". Please try a different search.`;

        // Append the message to the parent of category nav area
        const searchResultsContainer = document.querySelector('.search-container').parentNode; // adjust as necessary
        searchResultsContainer.appendChild(noResultsMessage);
      } else {
        // Show category navigation and Q&A sections
        if (categoriesContainer) categoriesContainer.style.display = 'block';
        if (qaContainer) qaContainer.style.display = 'block';

        // Remove "No results" message if it exists
        const noResultsMessage = document.querySelector('.search-no-results');
        if (noResultsMessage) {
          noResultsMessage.remove();
        }
      }
    } else {
      // If search term is empty, show category navigation and Q&A sections
      if (categoriesContainer) categoriesContainer.style.display = 'block';
      if (qaContainer) qaContainer.style.display = 'block';

      // Remove "No results" message if it exists
      const noResultsMessage = document.querySelector('.search-no-results');
      if (noResultsMessage) {
        noResultsMessage.remove();
      }
    }

    // --- Update the Search Results Counter ---
    const countElement = document.querySelector('.search-results-count');
    if (term) {
      if (matchCount > 0) {
        countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
        countElement.classList.remove('search-no-results');
      } else {
        countElement.textContent = `No results found for "${term}". Please try a different search.`;
        countElement.classList.add('search-no-results');
      }
      countElement.style.display = 'block';
    } else {
      countElement.style.display = 'none';
    }

    // Hide the entire Q&A container if no matching results.
    const qaOuterContainer = document.querySelector('.bsb-faq-3');
    if (qaOuterContainer) {
      qaOuterContainer.style.display = matchCount > 0 || term === '' ? 'block' : 'none';
    }
  });
}

// Helper function to escape regular expression special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialize search functionality
function initializeSearch(generateCategoryLinkText) {
  injectSearchStyles();
  handleSearch(generateCategoryLinkText);
}

// Attach to window for external initialization in categoryManager.js
window.initializeSearch = initializeSearch;
