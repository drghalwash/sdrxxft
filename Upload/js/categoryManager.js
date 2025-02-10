/********************************************
 * File: /js/categoryManager.js
 * Description: Complete category management system including 
 * configuration, navigation, content loading, and styling
 ********************************************/

// Central configuration for categories
const categoriesConfig = {
    face: {
        displayName: 'Face',
        ids: ["rhinoplasty", "facelift", "eyelidlift"]
    },
    breast: {
        displayName: 'Breast',
        ids: ["breastpsycho", "lollipoptechnique", "miniinvasivebreast", "breastaugmentation", "pocketlift"]
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

// Category display text mappings
const categoryDisplayTexts = {
    rhinoplasty: "Rhinoplasty",
    facelift: "Facelift",
    eyelidlift: "Eyelid Lift",
    breastpsycho: "Breast: Thinking all night",
    lollipoptechnique: "Breast Reduction: Lollipop technique",
    miniinvasivebreast: "Thinking about mini invasive",
    breastaugmentation: "Breast Augmentation",
    pocketlift: "Pocket Lift Breast Reduction",
    bodycontouring: "Body Contouring",
    fatgrafting: "Fat Grafting",
    tummytuck: "Tummy Tuck (Abdominoplasty)",
    brazilianbuttlift: "Brazilian Butt Lift (BBL)",
    mommyMakeover: "Mommy Makeover",
    botoxfillers: "Botox & Dermal Fillers",
    noninvasivecontouring: "Non-Invasive Body Contouring",
    hairtransplant: "Hair Transplant",
    skinresurfacing: "LASER SKIN RESURFACING"
};

// Inject required CSS styles
function injectStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .categories-container {
            margin: 2rem auto;
            max-width: 1200px;
            padding: 0 1rem;
        }

        .categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .category-group {
            background: #ffffff;
            border: 2px solid #ffa500;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .category-group h3 {
            background: #394464;
            color: white;
            padding: 0.8rem 1rem;
            margin: -1rem -1rem 1rem -1rem;
            border-radius: 6px 6px 0 0;
            font-size: 1.1rem;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .category-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        .category-item:last-child {
            border-bottom: none;
        }

        .category-item a {
            color: #495057;
            text-decoration: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .category-item a:hover {
            background: #f8f9fa;
            color: #007bff;
            padding-left: 1rem;
        }

        .status-indicator {
            font-size: 0.8em;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            background: #e9ecef;
        }

        .content-ready {
            background: #28a745;
            color: white;
        }

        .content-pending {
            background: #ffc107;
            color: #000;
        }

        .qa-block {
            background: white;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .qa-block h3 {
            color: #394464;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #ffa500;
        }

        .placeholder-content {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            padding: 2rem;
            text-align: center;
            border-radius: 8px;
            margin: 1rem 0;
        }

        @media (max-width: 768px) {
            .categories {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Load QnA content for a group
async function loadGroupContent(groupKey) {
    try {
        const response = await fetch(`/Qapartials/${groupKey}.handlebars`);
        if (!response.ok) {
            console.warn(`No content file found for group: ${groupKey}`);
            return null;
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading content for ${groupKey}:`, error);
        return null;
    }
}

// Generate category navigation
function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) return;

    Object.entries(categoriesConfig).forEach(([groupKey, group]) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';
        
        const header = document.createElement('h3');
        header.textContent = group.displayName;
        const countSpan = document.createElement('span');
        countSpan.className = 'category-count';
        countSpan.textContent = `${group.ids.length} items`;
        header.appendChild(countSpan);
        groupDiv.appendChild(header);

        group.ids.forEach(id => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'category-item';
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.innerHTML = `
                ${categoryDisplayTexts[id] || id}
                <span class="status-indicator" data-id="${id}">...</span>
            `;
            
            itemDiv.appendChild(link);
            groupDiv.appendChild(itemDiv);
        });

        navContainer.appendChild(groupDiv);
    });
}

// Process and display QnA content
async function processQnAContent() {
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (!qaContainer) return;

    // Clear existing content
    qaContainer.innerHTML = '';

    // Load and process each group
    for (const [groupKey, group] of Object.entries(categoriesConfig)) {
        const content = await loadGroupContent(groupKey);
        
        if (content) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'qa-group';
            groupDiv.innerHTML = content;

            // Update status indicators
            group.ids.forEach(id => {
                const hasContent = groupDiv.querySelector(`#${id}`);
                const indicator = document.querySelector(`.status-indicator[data-id="${id}"]`);
                if (indicator) {
                    indicator.textContent = hasContent ? '✓' : 'Pending';
                    indicator.className = `status-indicator ${hasContent ? 'content-ready' : 'content-pending'}`;
                }
            });

            qaContainer.appendChild(groupDiv);
        } else {
            // Create placeholder for missing group content
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-content';
            placeholder.innerHTML = `
                <h3>${group.displayName}</h3>
                <p>Content for this category is currently under development.</p>
            `;
            qaContainer.appendChild(placeholder);

            // Update status indicators for missing content
            group.ids.forEach(id => {
                const indicator = document.querySelector(`.status-indicator[data-id="${id}"]`);
                if (indicator) {
                    indicator.textContent = 'Pending';
                    indicator.className = 'status-indicator content-pending';
                }
            });
        }
    }
}

// Handle scroll to category
function handleCategoryScroll() {
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

// Initialize everything
function init() {
    injectStyles();
    generateCategoryNav();
    processQnAContent();
    
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.category-item a')) {
            e.preventDefault();
            const href = e.target.closest('a').getAttribute('href');
            window.location.hash = href;
            handleCategoryScroll();
        }
    });

    // Handle initial hash navigation
    window.addEventListener('load', handleCategoryScroll);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
