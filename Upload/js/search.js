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
            display: none !important;
        }

        .search-highlight {
            background-color: #fff3d6;
            padding: 2px 5px;
            border-radius: 3px;
            font-weight: bold;
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
        }

        .search-loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
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

    const config = { childList: true, subtree: true };

    domObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const searchTerm = document.getElementById('categorySearch')?.value.trim().toLowerCase() || '';
                if (searchTerm.length >= MIN_SEARCH_LENGTH) {
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
                displayNoResultsMessage(`Search failed.`);
            }
        }, DEBOUNCE_DELAY);
    });

    observeDOMChanges(generateCategoryLinkText);
}

// Core search logic
function performSearch(term, generateCategoryLinkText) {
    const results = { categories: 0, qaBlocks: 0 };
    const categoriesContainer = document.querySelector('.categories-container');
    const faqSection = document.querySelector('.bsb-faq-3');

    if (term.length < MIN_SEARCH_LENGTH) {
        resetDisplay();
        return;
    }

    resetDisplay();

    filterAndHighlight(term, generateCategoryLinkText, results);

    if (term && results.categories === 0 && results.qaBlocks === 0) {
        hideSections(categoriesContainer, faqSection);
    } else {
        showSections(categoriesContainer, faqSection);
    }

    observeDOMChanges(generateCategoryLinkText);

    function resetDisplay() {
        document.querySelectorAll('.category-group').forEach(el => el.classList.remove('category-hidden'));
        removeNoResultsMessage();
    }

    function filterAndHighlight(term, generateCategoryLinkText, results) {
        document.querySelectorAll('.category-group').forEach(group => {
           ...
           ...
