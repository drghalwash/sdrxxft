// File: /js/search.js
/********************************************
 * Enhanced search functionality with maximum pitfall prevention
 * and seamless integration
 ********************************************/

// Constants for better maintainability
const DEBOUNCE_DELAY = 300; // Adjust as needed
const HIGHLIGHT_CLASS = 'search-highlight';
const LOADING_CLASS = 'search-loading';
const NO_RESULTS_CLASS = 'search-no-results';
const MIN_SEARCH_LENGTH = 2; // Prevent over-eager searches
const MAX_SEARCH_RESULTS = 50; // Prevent performance drain with massive highlights

// Global variables for optimization and error handling
let searchDebounceTimer;
let previousSearchTerm = '';
let domObserver = null; // For dynamic content updates

function injectSearchStyles() {
    // Check if styles are already injected to prevent duplication
    if (document.getElementById('search-styles')) return;

    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
        .category-hidden {
            display: none !important;
            visibility: hidden;
            pointer-events: none;
        }

        .qa-hidden {
            opacity: 0;
            height: 0;
            overflow: hidden;
            transition: opacity 0.3s ease, height 0.3s ease;
            pointer-events: none;
            display: none !important; /* Ensure it's fully removed from layout */
        }

        .search-highlight {
            background-color: #fff3d6;
            padding: 2px 5px;
            border-radius: 3px;
            font-weight: bold;
            position: relative;
            z-index: 1;
        }

        .search-no-results {
            position: relative;
            text-align: center;
            padding: 40px 20px;
            font-size: 1.5em;
            color: #d9534f;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 80%;
            z-index: 2;
        }

        .search-loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
}

// Secure HTML sanitization
function sanitizeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic protection
}

// Optimized highlighting with safeguards
function highlightTerms(text, term) {
    if (!term || typeof text !== 'string' || text.length > 10000) return sanitizeHTML(text); // Protect against large content
    try {
        const safeTerm = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${safeTerm})`, 'gi');
        let matchCount = 0;
        return text.replace(regex, (match) => {
            if (matchCount++ >= MAX_SEARCH_RESULTS) return match; // Limit highlights
            return `<span class="${HIGHLIGHT_CLASS}">${sanitizeHTML(match)}</span>`;
        });
    } catch (error) {
        console.error('Highlighting error:', error);
        return sanitizeHTML(text);
    }
}

// Setup observer for dynamically loaded content
function observeDOMChanges(generateCategoryLinkText) {
    if (domObserver) domObserver.disconnect(); // Prevent multiple observers

    const targetNode = document.querySelector('.bsb-faq-3') || document.body; // Adjust selector as needed
    if (!targetNode) return;

    const config = { childList: true, subtree: true, characterData: true }; // Watch all relevant changes

    domObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const searchTerm = document.getElementById('categorySearch')?.value.trim().toLowerCase() || '';
                if (searchTerm.length >= MIN_SEARCH_LENGTH) {
                    // Re-run search only if search term is meaningful
                    performSearch(searchTerm, generateCategoryLinkText);
                }
            }
        }
    });

    domObserver.observe(targetNode, config);
}

// Main handler with comprehensive error handling
function handleSearch(generateCategoryLinkText) {
    const searchInput = document.getElementById('categorySearch');
    if (!searchInput) {
        console.error('Search input not found.');
        return;
    }

    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.trim().toLowerCase();

        if (term === previousSearchTerm) return; // Quick exit for no changes
        previousSearchTerm = term;

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            try {
                performSearch(term, generateCategoryLinkText);
            } catch (searchError) {
                console.error('Search process error:', searchError);
                displayNoResultsMessage(`Search failed: ${searchError.message || 'Unknown error'}`);
            }
        }, DEBOUNCE_DELAY);
    });

    // Start observing DOM for dynamic updates
    observeDOMChanges(generateCategoryLinkText);
}

// Core search logic
function performSearch(term, generateCategoryLinkText) {
    const results = { categories: 0, qaBlocks: 0 };
    const categoriesContainer = document.querySelector('.categories-container');
    const faqSection = document.querySelector('.bsb-faq-3');

    // Initial check for minimal search length
    if (term.length < MIN_SEARCH_LENGTH) {
        resetDisplay();
        return;
    }

    // Reset display elements before each search
    resetDisplay();

    // Highlight matched categories and Q&A
    filterAndHighlight(term, generateCategoryLinkText, results);

    // Hide or show sections based on search term
    if (term && results.categories === 0 && results.qaBlocks === 0) {
        hideSections(term, categoriesContainer, faqSection);
    } else {
        showSections(categoriesContainer, faqSection);
    }

    // Update global domObserver for ongoing content loads
    observeDOMChanges(generateCategoryLinkText);

    // Internal functions for code organization
    function resetDisplay() {
        document.querySelectorAll('.category-group, .mb-8').forEach(el => {
            el.classList.remove('category-hidden', 'qa-hidden');
            el.style.display = ''; // Reset any previous display settings

            // Remove highlight spans
            el.innerHTML = el.innerHTML.replace(new RegExp(`<span class="${HIGHLIGHT_CLASS}">(.*?)<\/span>`, 'gi'), '$1');
        });

        removeNoResultsMessage(); // Ensure the message is removed at start
    }

    function filterAndHighlight(term, generateCategoryLinkText, results) {
        document.querySelectorAll('.category-group').forEach(group => {
            const groupName = group.querySelector('h3')?.textContent.toLowerCase() || '';
            let hasVisibleItems = false;

            group.querySelectorAll('.category-item').forEach(item => {
                const itemText = item.textContent.toLowerCase();
                const isMatch = !term || itemText.includes(term) || groupName.includes(term);
                item.classList.toggle('category-hidden', !isMatch);
                item.style.display = isMatch ? '' : 'none'; // Ensure element is visible if matching

                if (isMatch) {
                    hasVisibleItems = true;
                    results.categories++;
                }
            });

            group.classList.toggle('category-hidden', !hasVisibleItems);
            group.style.display = hasVisibleItems ? '' : 'none'; // Ensure group is visible if matching
        });

        document.querySelectorAll('.mb-8').forEach(block => {
            let categoryMatch = false;
            try {
                const header = block.querySelector('h3');
                const categoryId = header?.id;
                categoryMatch = categoryId && generateCategoryLinkText(categoryId).toLowerCase().includes(term);

                const contentMatch = block.textContent.toLowerCase().includes(term);

                if ((categoryMatch || contentMatch) && term) {
                    block.classList.remove('qa-hidden');
                    block.style.display = ''; // Ensure element is visible if matching
                    block.innerHTML = highlightTerms(block.innerHTML, term);
                    results.qaBlocks++;
                } else {
                    block.classList.add('qa-hidden');
                    block.style.display = 'none !important'; // Ensure element is hidden if not matching
                }
            } catch (blockError) {
                console.error('Error processing block:', blockError);
            }
        });
    }

    function hideSections(term, categoriesContainer, faqSection) {
        displayNoResultsMessage(term);

        if (categoriesContainer) categoriesContainer.style.display = 'none';
        if (faqSection) faqSection.style.display = 'none'; // Ensure this is hidden correctly
    }

    function showSections(categoriesContainer, faqSection) {
        removeNoResultsMessage();

        if (categoriesContainer) categoriesContainer.style.display = '';
        if (faqSection) faqSection.style.display = ''; // Ensure this is displayed correctly
    }
}

// Enhanced DOM addition and removal
function displayNoResultsMessage(term) {
    removeNoResultsMessage(); // Prevent duplicates
    const container = document.querySelector('.categories-container')?.parentNode || document.body; // Fallback
    const message = document.createElement('div');
    message.className = NO_RESULTS_CLASS;
    message.innerHTML = `No results found for "${sanitizeHTML(term)}". Please refine your search.`;

    container.insertBefore(message, container.firstChild); // Ensure it's at the top
}

function removeNoResultsMessage() {
    const message = document.querySelector(`.${NO_RESULTS_CLASS}`);
    message?.remove();
}

// Initialize search functionality
function initializeSearch(generateCategoryLinkText) {
    try {
        injectSearchStyles();
        handleSearch(generateCategoryLinkText);
    } catch (initError) {
        console.error('Search initialization error:', initError);
    }
}

// Make initializeSearch available globally
window.initializeSearch = initializeSearch;
