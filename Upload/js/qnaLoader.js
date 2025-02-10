/********************************************
 * File: /public/upload/js/qnaLoader.js
 * Description: Handles loading and processing of Q&A content from Qapartials,
 * converting them into Bootstrap accordions and managing partial content states.
 ********************************************/

class QnALoader {
    constructor() {
        this.partialsPath = '/Qapartials'; // Path to partials
        this.containerSelector = '.bsb-faq-3 .row'; // Q&A container selector
        this.loadedGroups = new Map(); // Store loaded group content
    }

    /**
     * Initialize the loader and start content processing.
     */
    async init() {
        try {
            const container = document.querySelector(this.containerSelector);
            if (!container) {
                throw new Error('Q&A container not found. Ensure your HTML includes: <div class="bsb-faq-3"><div class="row"></div></div>');
            }

            // Show loading indicator
            this.showLoadingState(container);

            // Load all groups
            await this.loadAllGroups();

            // Render content after loading
            this.renderContent(container);

            // Initialize Bootstrap accordions
            this.initializeAccordions();

        } catch (error) {
            console.error('QnA Loader initialization failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Load content for all groups defined in categoriesConfig.
     */
    async loadAllGroups() {
        const loadPromises = Object.keys(categoriesConfig).map(async groupKey => {
            try {
                const groupContent = await this.loadGroupContent(groupKey);
                if (groupContent) {
                    this.loadedGroups.set(groupKey, groupContent);
                }
            } catch (error) {
                console.warn(`Failed to load group "${groupKey}":`, error);
            }
        });

        await Promise.all(loadPromises);
    }

    /**
     * Load content for a specific group.
     */
    async loadGroupContent(groupKey) {
        const url = `${this.partialsPath}/${groupKey}.handlebars.txt`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }
            const html = await response.text();
            return this.parseHTML(html, groupKey);
        } catch (error) {
            console.error(`Error loading group "${groupKey}":`, error);
            return null;
        }
    }

    /**
     * Parse HTML content for a group and extract relevant Q&A blocks.
     */
    parseHTML(html, groupKey) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const categories = categoriesConfig[groupKey]?.ids || [];

        return categories.map(categoryId => {
            const categoryElement = doc.getElementById(categoryId);
            return categoryElement ? categoryElement.outerHTML : null;
        }).filter(Boolean); // Remove null entries
    }

    /**
     * Render loaded Q&A content into the container.
     */
    renderContent(container) {
        const fragment = document.createDocumentFragment();

        this.loadedGroups.forEach((categories, groupKey) => {
            if (categories.length > 0) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'qa-group';

                // Add group header
                const header = document.createElement('h3');
                header.textContent = categoriesConfig[groupKey]?.displayName || groupKey;
                groupDiv.appendChild(header);

                // Append categories
                categories.forEach(categoryHTML => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = categoryHTML;
                    groupDiv.appendChild(tempDiv.firstElementChild); // Append only the first child
                });

                fragment.appendChild(groupDiv);
                fragment.appendChild(document.createElement('hr')); // Separator between groups
            }
        });

        container.innerHTML = ''; // Clear existing content
        container.appendChild(fragment); // Append all at once for better performance
    }

    /**
     * Initialize Bootstrap accordions after rendering content.
     */
    initializeAccordions() {
        document.querySelectorAll('.accordion').forEach(accordion => {
            if (typeof bootstrap !== 'undefined') {
                new bootstrap.Collapse(accordion.querySelector('.accordion-collapse.show'), { toggle: false });
            } else {
                console.warn('Bootstrap is not loaded. Accordions may not function correctly.');
            }
        });
    }

    /**
     * Show a loading state in the container.
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading Q&A content...</p>
            </div>
        `;
    }

    /**
     * Handle errors during initialization or loading.
     */
    handleError(error) {
        const container = document.querySelector(this.containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="error-message alert alert-danger">
                    <h4>Error Loading Content</h4>
                    <p>${error.message}</p>
                    <button class="btn btn-outline-danger btn-sm" onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize the loader when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new QnALoader();
    loader.init().catch(error => console.error('Failed to initialize QnA Loader:', error));
});
