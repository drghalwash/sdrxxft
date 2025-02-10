// File: /js/search.js

/********************************************
 * File: /js/search.js
 * Description:
 * - Handles search functionality.
 * - Filters categories and Q&A blocks based on the search term.
 * - Displays a styled "No results found" message when no matches exist.
 * - Hides Categories and Q&A sections when no matches are found.
 * - Highlights search terms in Q&A answers with a pop-up effect.
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
        display: none; /* Hidden by default */
    }
    /* Custom no-results message styling */
    .search-results-count.search-no-results {
        color: #d9534f;
        font-style: italic;
        font-size: 2em; /* Makes the font bigger */
        text-align: center; /* Centers the text */
        width: 100%; /* Ensures it takes the full width */
        padding: 20px; /* Adds some padding for better visibility */
        background-color: #f2dede; /* Light red background */
        border: 1px solid #ebccd1; /* Red border */
        border-radius: 5px; /* Rounded corners */
    }
    /* Highlight for potential search term wrap (if needed later) */
    .search-highlight {
        background-color: #fff3d6;
        padding: 2px 5px;
        border-radius: 3px;
        animation: pulseHighlight 1.5s ease-in-out;
    }

    @keyframes pulseHighlight {
        0% { transform: scale(1); background-color: #fff3d6; }
        50% { transform: scale(1.1); background-color: #ffef99; }
        100% { transform: scale(1); background-color: #fff3d6; }
    }
    /* Active category styling */
    .active-category {
        border-color: #007bff !important;
        box-shadow: 0 2px 8px rgba(0,123,255,0.2);
    }
  `;
    document.head.appendChild(style);
}

// Debounce function to limit search execution frequency
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Core search handler function
function handleSearch(generateCategoryLinkText) {
    const searchInput = document.getElementById('categorySearch');
    if (!searchInput) return;

    const debouncedSearch = debounce(function (term) {
        let matchCount = 0;

        // --- Selectors for Categories and Q&A Sections ---
        const categorySection = document.querySelector('.categories-container'); // Categories container
        const qaContainer = document.querySelector('.bsb-faq-3 .row'); // Q&A container

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
                let contentText = `${questionText} ${answerText}`;

                // --- Prevent Layout Breaking ---
                // Highlight only complete words, excluding HTML tag attributes
                if (term && term.length > 0) {
                    const regex = new RegExp(`\\b(${term})\\b(?!(?:(?!<\\w+).)*>)|(<[^>]*${term}[^>]*>)`, 'gi');
                    contentText = contentText.replace(regex, (match, group1, group2) => {
                        if (group1) {
                            return `<span class="search-highlight">${group1}</span>`;
                        } else if (group2) {
                            return group2; // Return the original HTML tag
                        }
                        return match;
                    });
                }

                item.querySelector('.accordion-body').innerHTML = contentText; // Update HTML

                const isMatch = contentText.toLowerCase().includes(term);
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

        // --- Update the Search Results Counter and Hide Sections ---
        const countElement = document.querySelector('.search-results-count');

        if (term) {
            if (matchCount > 0) {
                countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
                countElement.classList.remove('search-no-results');

                // Show Categories and Q&A sections
                if (categorySection) categorySection.style.display = 'block';
                if (qaContainer) qaContainer.style.display = 'block';

            } else {
                countElement.textContent = `No results found for "${term}". Please try a different search.`;
                countElement.classList.add('search-no-results');

                // Hide Categories and Q&A sections
                if (categorySection) categorySection.style.display = 'none';
                if (qaContainer) qaContainer.style.display = 'none';
            }

            countElement.style.display = 'block'; // Ensure the counter is visible
        } else {
            countElement.style.display = 'none'; // Hide counter when input is cleared

            // Show Categories and Q&A sections when input is cleared
            if (categorySection) categorySection.style.display = 'block';
            if (qaContainer) qaContainer.style.display = 'block';
            // Remove highlights when search term is cleared
            document.querySelectorAll('.accordion-body').forEach(body => {
                body.innerHTML = body.textContent; // Revert to original text
            });
        }

    }, 300);

    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.toLowerCase().trim();
        debouncedSearch(term);
    });
}

// Initialize search functionality—inject styles and set up event handlers
function initializeSearch(generateCategoryLinkText) {
    injectSearchStyles();
    handleSearch(generateCategoryLinkText);
}

// Expose our initialization so it can be invoked on DOMContentLoaded
window.initializeSearch = initializeSearch;
