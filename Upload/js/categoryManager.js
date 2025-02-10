/********************************************
 * File: /js/categoryManager.js
 * Description: Manages category navigation and grouping of Q&A blocks.
 ********************************************/

// Central configuration for categories
const categoriesConfig = {
    face: {
        displayName: 'Face',
        ids: ["rhinoplasty", "facelift", "eyelidlift"]
    },
    breast: {
        displayName: 'Breast',
        ids: ["breastpsycho", "lollipoptechnique", "miniinvasivebreast"]
    },
    body: {
        displayName: 'Body',
        ids: ["bodycontouring", "fatgrafting", "tummytuck", "brazilianbuttlift", "mommyMakeover"]
    },
    minimally_invasive: {
        displayName: 'Minimally Invasive',
        ids: ["botoxfillers", "noninvasivecontouring"]
    },
    other: {
        displayName: 'Other',
        ids: ["hairtransplant", "skinresurfacing"]
    }
};

// Helper function to get friendly display text for a category ID
const categoryDisplayTexts = {
    rhinoplasty: "Rhinoplasty",
    facelift: "Facelift",
    eyelidlift: "Eyelid Lift",
    breastpsycho: "Breast Thinking All Night",
    lollipoptechnique: "Lollipop Technique",
    miniinvasivebreast: "Minimal-Incision Breast Reduction",
    bodycontouring: "Body Contouring",
    fatgrafting: "Fat Grafting",
    tummytuck: "Tummy Tuck (Abdominoplasty)",
    brazilianbuttlift: "Brazilian Butt Lift (BBL)",
    mommyMakeover: "Mommy Makeover",
    botoxfillers: "Botox & Dermal Fillers",
    noninvasivecontouring: "Non-Invasive Body Contouring",
    hairtransplant: "Hair Transplant",
    skinresurfacing: "Laser Skin Resurfacing"
};

/**
 * Generate dynamic category navigation.
 * Displays all groups in the navigation area.
 */
function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) {
        console.error('Navigation container not found.');
        return;
    }

    // Clear existing content
    navContainer.innerHTML = '';

    Object.keys(categoriesConfig).forEach(groupKey => {
        const group = categoriesConfig[groupKey];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';

        // Create header for the group with dark blue background
        const header = document.createElement('h3');
        header.textContent = group.displayName;
        header.style.cssText = `
            background-color: #394464;
            color: white;
            font-family: Verdana, sans-serif;
            font-weight: bold;
            font-size: 1.1em;
            padding: 8px 15px;
            margin-bottom: 15px;
            border-radius: 0 20px 20px 0;
        `;
        groupDiv.appendChild(header);

        // Create category links
        group.ids.forEach(id => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'category-item';

            const aElem = document.createElement('a');
            aElem.href = `#${id}`;
            aElem.textContent = categoryDisplayTexts[id] || id;

            aElem.style.cssText = `
                color: #495057;
                text-decoration: none;
                font-family: Verdana, sans-serif;
                font-size: 0.95em;
                transition: color 0.3s ease;
            `;
            
            // Add hover effects via JavaScript instead of CSS
            aElem.addEventListener('mouseenter', () => {
                aElem.style.color = '#007bff';
                aElem.style.fontWeight = 'bold';
            });
            aElem.addEventListener('mouseleave', () => {
                aElem.style.color = '#495057';
                aElem.style.fontWeight = 'normal';
            });

            itemDiv.appendChild(aElem);
            groupDiv.appendChild(itemDiv);
        });

        navContainer.appendChild(groupDiv);
    });
}

/**
 * Group Q&A blocks based on category ID.
 * Only groups with available Q&A content are displayed in the Q&A area.
 */
function groupQABlocks() {
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (!qaContainer) {
        console.error('Q&A container not found.');
        return;
    }

    // Clear existing content
    qaContainer.innerHTML = '';

    Object.keys(categoriesConfig).forEach(groupKey => {
        // Check if there is any Q&A content in the group
        const hasQAContent = categoriesConfig[groupKey].ids.some(id => {
            const element = document.getElementById(id);
            return element !== null; // Check if the element exists
        });

        if (hasQAContent) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'qa-group';

            // Create header for the group with dark blue background
            const header = document.createElement('h3');
            header.textContent = categoriesConfig[groupKey].displayName;
            header.style.cssText = `
                background-color: #394464;
                color: white;
                font-family: Verdana, sans-serif;
                font-weight: bold;
                font-size: 1.1em;
                padding: 8px 15px;
                margin-bottom: 15px;
                border-radius: 0 20px 20px 0;
            `;
            groupDiv.appendChild(header);

            // Append Q&A content for this group
            categoriesConfig[groupKey].ids.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    groupDiv.appendChild(element);
                }
            });

            qaContainer.appendChild(groupDiv);
            qaContainer.appendChild(document.createElement('hr'));
        }
    });
}

/**
 * Initialize responsive design for the category navigation grid.
 * Adjusts the grid columns based on window size.
 */
function handleResponsiveDesign() {
    const categories = document.querySelector('.categories');
    if (!categories) return;

    const updateGrid = () => {
        const width = window.innerWidth;
        if (width <= 576) {
            categories.style.gridTemplateColumns = 'repeat(1, minmax(200px, auto))';
        } else if (width <= 768) {
            categories.style.gridTemplateColumns = 'repeat(2, minmax(200px, auto))';
        } else if (width <= 1200) {
            categories.style.gridTemplateColumns = 'repeat(3, minmax(200px, auto))';
        } else {
            categories.style.gridTemplateColumns = 'repeat(4, minmax(200px, auto))';
        }
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
}

/**
 * Initialize all functionality when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    generateCategoryNav();
    
    // Wait for qnaLoader.js to load Q&A partials before grouping them
    setTimeout(() => { 
      groupQABlocks(); 
      handleResponsiveDesign(); 
   }, 500); // Adjust delay as needed based on loading time
});

/********************************************
 * File: /public/upload/js/qnaLoader.js
 * Description: Handles loading and processing of Q&A content from .txt files,
 * converting them into valid HTML partials with self-healing for mismatched tags.
 ********************************************/

class QnALoader {
    constructor() {
        this.partialsPath = '/Qapartials'; // Path to Q&A partials
        this.containerSelector = '.bsb-faq-3 .row'; // Selector for Q&A container
        this.loadedGroups = new Map(); // Stores loaded group content
    }

    /**
     * Initialize the loader and start content processing.
     */
    async init() {
        try {
            const container = document.querySelector(this.containerSelector);
            if (!container) {
                console.error('Q&A container not found.');
                document.body.innerHTML += '<div class="error">Q&A container not found.</div>'; // Display error in body
                return; // Stop execution if container is not found
            }

            // Clear any existing content
            container.innerHTML = '';

            // Load and process all groups
            await this.loadAllGroups();

            // Render content
            this.renderContent(container);

        } catch (error) {
            console.error('QnA Loader initialization failed:', error);
        }
    }

    /**
     * Load all groups defined in categoriesConfig.
     */
    async loadAllGroups() {
        const loadPromises = Object.keys(categoriesConfig).map(async groupKey => {
            const groupContent = await this.loadGroupContent(groupKey);
            this.loadedGroups.set(groupKey, groupContent);
        });

        await Promise.all(loadPromises);
    }

    /**
     * Load content for a specific group.
     */
    async loadGroupContent(groupKey) {
        try {
            const response = await fetch(`${this.partialsPath}/${groupKey}.txt`);
            if (!response.ok) {
                console.warn(`Group file not found: ${groupKey}.txt`);
                return `<div class="error">Group file not found: ${groupKey}.txt</div>`; // Return error message
            }

            const rawText = await response.text();
            return this.convertToHTML(rawText);

        } catch (error) {
            console.error(`Error loading group ${groupKey}:`, error);
            return '<div class="error">Error loading group content.</div>'; // Return error message
        }
    }

    /**
     * Convert raw text content into valid HTML.
     */
    convertToHTML(rawText) {
        try {
            // Parse the raw text into lines
            const lines = rawText.split('\n').map(line => line.trim()).filter(line => line !== '');
            
            let html = '';
            let openDivCount = 0; // Track open div tags
            let currentQuestion = '';

            lines.forEach(line => {
                if (line.startsWith('##CATEGORY_ID=')) {
                    const categoryId = line.split('=')[1].trim();
                    html += `<div class="mb-8" id="${categoryId}">\n`;
                    openDivCount++;
                } else if (line.startsWith('##TITLE=')) {
                    const title = line.split('=')[1].trim();
                    html += `<h3>${title}</h3>\n`;
                } else if (/^\d+\.\s/.test(line)) { // Detect questions starting with "1. ", "2. ", etc.
                    currentQuestion = line;
                    html += `<div class="accordion-item">\n`;
                    html += `<h2 class="accordion-header">\n`;
                    html += `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${line}" aria-expanded="false" aria-controls="collapse_${line}">\n`;
                    html += `${currentQuestion}\n`;
                    html += `</button>\n</h2>\n`;
                } else { // Assume it's an answer or other content
                    html += `<div class="accordion-body">\n${line}\n</div>\n</div>\n`; // Close accordion-item
                }
            });

            // Self-healing: Ensure all opened <div> tags are closed
            const closeDivCount = (html.match(/<\/div>/g) || []).length;

            if (openDivCount > closeDivCount) {
                html += '</div>'.repeat(openDivCount - closeDivCount);
                console.warn(`Self-healing applied: Closed ${openDivCount - closeDivCount} unclosed <div> tags.`);
            }

            return html;

        } catch (error) {
            console.error('Error converting raw text to HTML:', error);
            return '<div class="error">Error processing content.</div>';
        }
    }

    /**
     * Render all loaded content into the container.
     */
    renderContent(container) {
        Object.keys(categoriesConfig).forEach(groupKey => {
            const groupContent = this.loadedGroups.get(groupKey);
            if (groupContent) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'qa-group';
                groupDiv.innerHTML = groupContent;
                container.appendChild(groupDiv);
            }
        });
    }
}

// Initialize the loader when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new QnALoader();
    loader.init().catch(error => {
        console.error('Failed to initialize QnA Loader:', error);
    });
});
