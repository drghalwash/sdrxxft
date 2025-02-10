/********************************************
 * File: /public/upload/js/qnaLoader.js
 * Description: Handles loading and processing of Q&A content from Qapartials,
 * converting them into Bootstrap accordions and managing partial content states.
 ********************************************/

class QnALoader {
    constructor() {
        // Core configuration
        this.partialsPath = '/Qapartials';
        this.containerSelector = '.bsb-faq-3 .row';
        this.loadedGroups = new Map();
        this.contentValidationMap = new Map();

        // Bind methods to the class instance
        this.createPlaceholderContent = this.createPlaceholderContent.bind(this);
        this.processGroupContent = this.processGroupContent.bind(this);
        this.extractQAItems = this.extractQAItems.bind(this);
        this.createAccordionHTML = this.createAccordionHTML.bind(this);
    }

    /**
     * Initialize the loader and start content processing
     */
    async init() {
        try {
            const container = document.querySelector(this.containerSelector);
            if (!container) {
                throw new Error('Q&A container not found. Ensure your HTML includes: <div class="bsb-faq-3"><div class="row"></div></div>');
            }

            // Clear any existing content
            container.innerHTML = '';

            // Add loading indicator
            this.showLoadingState(container);

            // Load and process all groups
            await this.loadAllGroups();

            // Remove loading indicator and render content
            this.hideLoadingState(container);
            this.renderContent(container);

            // Initialize Bootstrap accordions
            this.initializeAccordions();

            // Set up content validation
            this.validateLoadedContent();

        } catch (error) {
            console.error('QnA Loader initialization failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Load content for a specific group
     */
    async loadGroupContent(groupKey) {
        try {
            const response = await fetch(`${this.partialsPath}/${groupKey}.handlebars`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Group file not found: ${groupKey}.handlebars`);
                    return this.createPlaceholderContent(groupKey);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();
            return this.processGroupContent(content, groupKey);

        } catch (error) {
            console.error(`Error loading group ${groupKey}:`, error);
            return this.createPlaceholderContent(groupKey);
        }
    }

    /**
     * Process raw group content into structured Q&A format
     */
    processGroupContent(content, groupKey) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const processedContent = {
            groupKey,
            categories: []
        };

        // Process each category in the group
        categoriesConfig[groupKey]?.ids.forEach(categoryId => {
            const categorySection = doc.getElementById(categoryId);
            if (categorySection) {
                const qaItems = this.extractQAItems(categorySection);
                processedContent.categories.push({
                    id: categoryId,
                    title: categoryDisplayTexts[categoryId] || categoryId,
                    items: qaItems,
                    isImplemented: true
                });
            } else {
                processedContent.categories.push({
                    id: categoryId,
                    title: categoryDisplayTexts[categoryId] || categoryId,
                    items: [],
                    isImplemented: false
                });
            }
        });

        return processedContent;
    }

    /**
     * Extract Q&A items from a category section
     */
    extractQAItems(categorySection) {
        const items = [];
        // Adjusted selector to match the provided Breast.handlebars structure [1]
        const qaBlocks = categorySection.querySelectorAll('.accordion-item'); 
        
        qaBlocks.forEach((block, index) => {
            const question = block.querySelector('.btn-link')?.textContent?.trim();
            const answer = block.querySelector('.accordion-body')?.innerHTML?.trim();
            
            if (question && answer) {
                items.push({
                    id: `qa-${categorySection.id}-${index}`,
                    question,
                    answer,
                    isExpanded: index === 0 // First item expanded by default
                });
            }
        });

        return items;
    }

    /**
     * Create accordion HTML for a category
     */
    createAccordionHTML(category) {
       if (!category.isImplemented || category.items.length === 0) {
            return ''; // Return empty string if category is not implemented
        }
    
        const accordionId = `accordion_${category.id}`;
        let html = `
            <div class="mb-8">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-11 col-xl-10">
                            <div class="d-flex align-items-end mb-5">
                                <h3 class="m-0" id="${category.id}">${category.title}</h3>
                            </div>
                        </div>
                        <div class="col-11 col-xl-10">
                            <div class="col-lg-5 mt-4 mt-lg-0" data-aos="fade-up" data-aos-delay="100" style="width: 100% !important;">
                                <div class="custom-accordion" id="${accordionId}">
        `;
    
        category.items.forEach((item, index) => {
            html += `
                <div class="accordion-item">
                    <h2 class="mb-0">
                        <button class="btn btn-link ${item.isExpanded ? '' : 'collapsed'}"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#${item.id}"
                                aria-expanded="${item.isExpanded}"
                                aria-controls="${item.id}">
                            ${item.question}
                        </button>
                    </h2>
                    <div id="${item.id}"
                         class="accordion-collapse collapse ${item.isExpanded ? 'show' : ''}"
                         data-bs-parent="#${accordionId}">
                        <div class="accordion-body">
                            ${item.answer}
                        </div>
                    </div>
                </div>
            `;
        });
    
        html += `
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        return html;
    }

    /**
     * Create HTML for a pending/unimplemented category
     */
    createPendingCategoryHTML(category) {
        return ''; // Return empty string to avoid creating placeholder HTML
    }

        /**
     * Create placeholder content for a group
     */
    createPlaceholderContent(groupKey) {
        return {
            groupKey,
            categories: categoriesConfig[groupKey]?.ids.map(categoryId => ({
                id: categoryId,
                title: categoryDisplayTexts[categoryId] || categoryId,
                items: [],
                isImplemented: false
            })) || []
        };
    }

    /**
     * Load all groups and their content
     */
    async loadAllGroups() {
        const loadPromises = Object.keys(categoriesConfig).map(async groupKey => {
            const groupContent = await this.loadGroupContent(groupKey);
            this.loadedGroups.set(groupKey, groupContent);
        });

        await Promise.all(loadPromises);
    }

    /**
     * Render all loaded content to the container
     */
    renderContent(container) {
        Object.keys(categoriesConfig).forEach(groupKey => {
            const groupContent = this.loadedGroups.get(groupKey);
            if (groupContent) {
                let hasContent = false;
                groupContent.categories.forEach(category => {
                    if(category.isImplemented && category.items.length > 0) {
                        hasContent = true;
                    }
                });
                if(hasContent) {
                  const groupDiv = document.createElement('div');
                  groupDiv.className = 'qa-group';
                  groupContent.categories.forEach(category => {
                      groupDiv.innerHTML += this.createAccordionHTML(category);
                  });

                  container.appendChild(groupDiv);
                }
            }
        });
    }

    /**
     * Initialize Bootstrap accordions after content is loaded
     */
    initializeAccordions() {
        document.querySelectorAll('.accordion').forEach(accordionElement => {
            // Ensure Bootstrap is available
            if (typeof bootstrap !== 'undefined') {
                new bootstrap.Collapse(accordionElement.querySelector('.accordion-collapse.show'), {
                    toggle: false
                });
            }
        });
    }

    /**
     * Validate loaded content and update status indicators
     */
    validateLoadedContent() {
        this.loadedGroups.forEach((groupContent, groupKey) => {
            groupContent.categories.forEach(category => {
                const statusIndicator = document.querySelector(`.status-indicator[data-id="${category.id}"]`);
                if (statusIndicator) {
                    statusIndicator.textContent = category.isImplemented ? '✓' : 'Pending';
                    statusIndicator.className = `status-indicator ${category.isImplemented ? 'content-ready' : 'content-pending'}`;
                }
            });
        });
    }

    /**
     * Show loading state
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
     * Hide loading state
     */
    hideLoadingState(container) {
        const loadingIndicator = container.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    /**
     * Handle errors during loading
     */
    handleError(error) {
        const container = document.querySelector(this.containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="error-message alert alert-danger">
                    <h4>Error Loading Content</h4>
                    <p>${error.message}</p>
                    <button class="btn btn-outline-danger btn-sm" onclick="window.location.reload()">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Initialize the loader when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new QnALoader();
    loader.init().catch(error => {
        console.error('Failed to initialize QnA Loader:', error);
    });
});
