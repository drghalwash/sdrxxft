// File: /js/search.js

/********************************************
 * File: /js/search.js
 * Description:
 * - Handles search functionality with enhanced features.
 * - Filters categories and Q&A blocks based on the search term.
 * - Displays a styled "No results found" message when no matches exist.
 * - Hides Categories and Q&A sections when no matches are found.
 * - Highlights search terms in Q&A answers with a dynamic pop-up effect.
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
    /* Highlight for potential search term wrap */
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
    /* Results counter style */
    .search-results-count {
        color: #394464;
        font-weight: bold;
        margin: 15px 0;
        display: none; /* Hidden by default */
    }
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
    /* Dynamic Highlight Style (Feature 1) */
    .search-highlight {
        background-color: #ffef99; /* softer highlight */
        padding: 2px 5px;
        border-radius: 3px;
        animation: pulseHighlight 1.5s ease-in-out;
    }
    @keyframes pulseHighlight {
        0% { transform: scale(1); background-color: #ffef99; }
        50% { transform: scale(1.1); background-color: #ffffcc; }
        100% { transform: scale(1); background-color: #ffef99; }
    }
    /* Accessibility Improvements (Feature 2) */
    .visually-hidden {
        position: absolute !important;
        height: 1px; width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap; /* added line */
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

// Highlight search terms in text content (Feature 3: Enhanced Highlighting)
function highlightText(content, term) {
    if (!term) return content;

    // Enhanced Regex to avoid breaking HTML tags (Feature 4)
    const regex = new RegExp(`(${term})(?!(?:(?!<\\w+).)*>)`, 'gi');

    return content.replace(regex, '<span class="search-highlight">$1</span>');
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
                const questionElement = item.querySelector('.btn-link');
                const answerElement = item.querySelector('.accordion-body');

                 // Accessibility: Add aria-live region (Feature 5)
                const liveRegion = document.createElement('div');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.className = 'visually-hidden';
                answerElement.parentNode.insertBefore(liveRegion, answerElement.nextSibling);

                // Preserve original content (Feature 6: Prevents data loss)
                if (!answerElement.dataset.originalContent) {
                    answerElement.dataset.originalContent = answerElement.innerHTML.trim();
                }

                // Highlight logic and set initial state
                const originalQuestionText = questionElement.textContent;
                const originalAnswerText = answerElement.dataset.originalContent;

                const isMatch =
                    originalQuestionText.toLowerCase().includes(term) ||
                    originalAnswerText.toLowerCase().includes(term);

                if (isMatch && term.length > 0) {
                    // Accessibility update (Feature 7)
                   liveRegion.textContent = `Search term "${term}" found in this section.`;

                    questionElement.innerHTML = highlightText(originalQuestionText, term);
                    answerElement.innerHTML = highlightText(originalAnswerText, term);
                    sectionHasMatch = true;
                } else {
                     // Clear accessibility announcement (Feature 8)
                    liveRegion.textContent = '';
                }

                item.style.display = isMatch ? '' : 'none';

                // Expand matching items (Feature 9: Enhanced UX)
                if (isMatch && term.length > 0) {
                    const collapseElement = item.querySelector('.collapse');
                    if (collapseElement && !collapseElement.classList.contains('show')) {
                        new bootstrap.Collapse(collapseElement, { show: true });
                    }
                }
            });

            section.style.display =
                sectionHasMatch || sectionTitle.includes(term) ? '' : 'none';

            if ((sectionHasMatch || sectionTitle.includes(term)) && term !== '') {
                section.classList.remove('qa-hidden');
                matchCount++;
            } else if (term === '') {
                section.classList.remove('qa-hidden');
                // Clear highlighting (Feature 10: Clean slate)
                  questions.forEach(item => {
                    const questionElement = item.querySelector('.btn-link');
                    const answerElement = item.querySelector('.accordion-body');

                    questionElement.innerHTML = questionElement.textContent;
                    answerElement.innerHTML = answerElement.dataset.originalContent;
                  });

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
               // Clear all highlights (Feature 10)
               questions.forEach(item => {
                const questionElement = item.querySelector('.btn-link');
                const answerElement = item.querySelector('.accordion-body');

                questionElement.innerHTML = questionElement.textContent;
                answerElement.innerHTML = answerElement.dataset.originalContent;
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
