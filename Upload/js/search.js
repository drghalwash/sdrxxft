// File: /js/search.js
/********************************************
 * File: /js/search.js
 * Description: Handles search functionality:
 *  - Filters categories and Q&A blocks based on the search term.
 *  - Auto-labels each visible result (e.g., "Result 1").
 *  - Displays a custom message if no results are found.
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
    }
    /* Active category styling */
    .active-category {
        border-color: #007bff !important;
        box-shadow: 0 2px 8px rgba(0,123,255,0.2);
    }
  `;
    document.head.appendChild(style);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Core search handler function. Pass in generateCategoryLinkText (from your categoryManager.js)
// which maps a category id to its display text.
function handleSearch(generateCategoryLinkText) {
    const searchInput = document.getElementById('categorySearch');
    if (!searchInput) return;

    const debouncedSearch = debounce(function (term) {
        let matchCount = 0;

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
        document.querySelectorAll('.mb-8').forEach(section => {
            const sectionTitle = section.querySelector('h3')?.textContent.toLowerCase() || '';
            const questions = section.querySelectorAll('.accordion-item');
            let sectionHasMatch = false;

            questions.forEach(item => {
                const questionText = item.querySelector('.btn-link')?.textContent.toLowerCase() || '';
                const answerText = item.querySelector('.accordion-body')?.textContent.toLowerCase() || '';
                const contentText = `${questionText} ${answerText}`;

                const isMatch = contentText.includes(term);
                item.style.display = isMatch ? '' : 'none';
                if (isMatch) sectionHasMatch = true;

                // Expand matching items
                if (isMatch && term.length > 0) {
                    const collapseElement = item.querySelector('.collapse');
                    if (collapseElement && !collapseElement.classList.contains('show')) {
                        new bootstrap.Collapse(collapseElement, { show: true });
                    }
                }
            });

            // Show/hide entire section based on matches
            section.style.display = sectionHasMatch || sectionTitle.includes(term) ? '' : 'none';

            if ((sectionHasMatch || sectionTitle.includes(term)) && term !== "") {
                section.classList.remove('qa-hidden');
                matchCount++;
            } else if (term === "") {
                // When search term is cleared, reset all blocks
                section.classList.remove('qa-hidden');
            } else {
                section.classList.add('qa-hidden');
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

        // Option: Hide the entire Q&A container if no matching results.
        const qaContainer = document.querySelector('.bsb-faq-3 .row');
        if (qaContainer) {
            qaContainer.style.display = matchCount > 0 || term === '' ? 'block' : 'none';
        }
    }, 300);

    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.toLowerCase().trim();
        debouncedSearch(term);
    });
}

// Initialize search functionality—inject styles and set up event handlers.
// Make sure to pass generateCategoryLinkText from your categoryManager.js.
function initializeSearch(generateCategoryLinkText) {
    injectSearchStyles();
    handleSearch(generateCategoryLinkText);
}

// Expose our initialization so categoryManager.js can invoke it on DOMContentLoaded.
window.initializeSearch = initializeSearch;
