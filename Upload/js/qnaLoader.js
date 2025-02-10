// Define categoriesConfig with example groups
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
