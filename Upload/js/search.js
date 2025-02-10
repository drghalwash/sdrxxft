// File: /js/search.js
/********************************************
 * File: /js/search.js
 * Description: Enhances search functionality by:
 *  - Filtering categories and Q&A blocks based on search terms.
 *  - Highlighting matching words dynamically in the results.
 *  - Dynamically displays/hides sections based on search results, showing a "No results found" message when appropriate.
 *  - Provides inline CSS injection for styling.
 *  - Adds a loading indicator during search.
 ********************************************/

// Inject inline CSS to style search components
function injectSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Category visibility control */
    .category-hidden { display: none !important; }

    /* Q&A block visibility and transition */
    .qa-hidden {
      opacity: 0;
      height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    /* Highlight style for search matches */
    .search-highlight {
      background-color: #fff3d6;
      padding: 2px;
      border-radius: 3px;
      font-weight: bold; /* Ensures highlighted words stand out */
    }

    /* Style for the loading indicator */
    .search-loading {
      text-align: center;
      font-style: italic;
      color: #555;
      margin: 10px 0;
    }

    /* Style for the "No Results Found" message */
    .search-no-results {
      color: #d9534f;
      font-size: 1.5em;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    /* Active category style */
    .active-category {
      border-color: #007bff !important;
      box-shadow: 0 2px 8px rgba(0,123,255,0.2);
    }
  `;
  document.head.appendChild(style);
}

// Utility function to sanitize HTML to prevent XSS attacks
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Utility function to highlight search terms in text
function highlightTerms(text, term) {
  if (!term) return sanitizeHTML(text); // No term, no highlighting

  // Safely escape special characters for regex
  const safeTerm = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${safeTerm})`, 'gi');
  const highlightedText = text.replace(regex, '<span class="search-highlight">$1</span>');
  return highlightedText;
}

// Main search handler function that orchestrates the search functionality
function handleSearch(generateCategoryLinkText) {
  const searchInput = document.getElementById('categorySearch');
  if (!searchInput) {
    console.warn('Search input not found.');
    return;
  }

  searchInput.addEventListener('input', function(e) {
    const term = e.target.value.trim().toLowerCase();
    performSearch(term, generateCategoryLinkText);
  });
}

// Function to encapsulate and manage the search process
function performSearch(term, generateCategoryLinkText) {
  // Display loading indicator immediately
  showLoadingIndicator();
  
  // Use a timeout to simulate a loading delay and ensure smooth UI updates
  setTimeout(() => {
    try {
      // Reset and perform search
      resetSearchResults(term);
      const matchCount = executeSearch(term, generateCategoryLinkText);

      // Handle visibility based on search results
      handleVisibility(matchCount, term);
    } finally {
      // Always hide loading indicator after search completes
      hideLoadingIndicator();
    }
  }, 100); // Delay of 100ms for smoother UX
}

// Resets search results by removing highlighting and QA classes
function resetSearchResults(term) {
  document.querySelectorAll('.mb-8').forEach(block => {
    block.classList.remove('qa-hidden');
    // Restore original text by removing any search highlights
    block.innerHTML = block.innerHTML.replace(/<span class="search-highlight">(.*?)<\/span>/g, '$1');
  });
}

// Executes the search and filtering logic
function executeSearch(term, generateCategoryLinkText) {
  let matchCount = 0;

  // Filter category navigation
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

  // Filter Q&A Blocks and highlight search terms
  document.querySelectorAll('.mb-8').forEach(block => {
    let categoryMatch = false;
    const header = block.querySelector('h3');
    if (header && header.id) {
      categoryMatch = generateCategoryLinkText(header.id).toLowerCase().includes(term);
    }
    const contentMatch = block.textContent.toLowerCase().includes(term);

    if ((categoryMatch || contentMatch) && term !== "") {
      block.classList.remove('qa-hidden');
      block.innerHTML = highlightTerms(block.innerHTML, term); // Highlight the search term
      matchCount++;
    } else if (term === "") {
      block.classList.remove('qa-hidden'); // Reset state if search term is cleared
    } else {
      block.classList.add('qa-hidden');
    }
  });

  return matchCount;
}

// Handles displaying/hiding elements based on search results
function handleVisibility(matchCount, term) {
  const categoriesContainer = document.querySelector('.categories-container');
  const faqContainer = document.querySelector('.bsb-faq-3'); // Q&A Section

  if (matchCount === 0 && term !== "") {
    // Hide Categories and Q&A sections
    if (categoriesContainer) categoriesContainer.style.display = 'none';
    if (faqContainer) faqContainer.style.display = 'none';

    // Display "No Results Found" message
    displayNoResultsMessage(term);
  } else {
    // Restore Categories and Q&A sections
    if (categoriesContainer) categoriesContainer.style.display = '';
    if (faqContainer) faqContainer.style.display = '';

    // Remove "No Results Found" message
    removeNoResultsMessage();
  }
}

// Displays the loading indicator
function showLoadingIndicator() {
  const categoriesContainer = document.querySelector('.categories-container');
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'search-loading';
  loadingIndicator.textContent = 'Loading...';

  // Attempt to add the loading message before the categories container
  if (categoriesContainer && categoriesContainer.parentNode) {
    categoriesContainer.parentNode.insertBefore(loadingIndicator, categoriesContainer);
  } else {
    // Fallback to adding it to the body if the categories container is not found
    document.body.appendChild(loadingIndicator);
  }
}

// Hides the loading indicator
function hideLoadingIndicator() {
  const loadingIndicator = document.querySelector('.search-loading');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

// Displays the "No Results Found" message
function displayNoResultsMessage(term) {
  const categoriesContainer = document.querySelector('.categories-container');
  const noResultsMessage = document.createElement('div');
  noResultsMessage.className = 'search-no-results';
  noResultsMessage.innerHTML = `No results found for "<span class="search-highlight">${sanitizeHTML(term)}</span>". Please try a different search.`;

  // Attempt to insert the message before the categories container
  if (categoriesContainer && categoriesContainer.parentNode) {
    categoriesContainer.parentNode.insertBefore(noResultsMessage, categoriesContainer);
  } else {
    // Fallback to adding it to the body if categories container is not found
    document.body.appendChild(noResultsMessage);
  }
}

// Removes the "No Results Found" message
function removeNoResultsMessage() {
  const noResultsMessage = document.querySelector('.search-no-results');
  if (noResultsMessage) {
    noResultsMessage.remove();
  }
}

// Initializes search functionality—inject styles and set up event handlers.
function initializeSearch(generateCategoryLinkText) {
  injectSearchStyles();
  handleSearch(generateCategoryLinkText);
}

// Assign to window for external access
window.initializeSearch = initializeSearch;
