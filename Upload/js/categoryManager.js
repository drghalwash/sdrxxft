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
 * Displays all groups and their respective categories in the navigation area.
 */
function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) {
        console.error('Navigation container not found.');
        return;
    }

    // Clear existing content (if any)
    navContainer.innerHTML = '';

    Object.keys(categoriesConfig).forEach(groupKey => {
        const group = categoriesConfig[groupKey];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';

        // Create header for the group
        const header = document.createElement('h3');
        header.textContent = group.displayName;
        groupDiv.appendChild(header);

        // Create category links
        group.ids.forEach(id => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'category-item';

            const aElem = document.createElement('a');
            aElem.href = `#${id}`;
            aElem.textContent = categoryDisplayTexts[id] || id;

            itemDiv.appendChild(aElem);
            groupDiv.appendChild(itemDiv);
        });

        navContainer.appendChild(groupDiv);
    });
}

/**
 * Group Q&A blocks based on category ID.
 * Only displays groups with available Q&A content in the Q&A area.
 */
function groupQABlocks() {
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (!qaContainer) {
        console.error('Q&A container not found.');
        return;
    }

    // Clear existing content (if any)
    qaContainer.innerHTML = '';

    Object.keys(categoriesConfig).forEach(groupKey => {
        const group = categoriesConfig[groupKey];
        
        // Check if there is any Q&A content for this group
        const hasQAContent = group.ids.some(id => !!document.getElementById(id));
        
        if (hasQAContent) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'qa-group';

            // Create header for the group
            const header = document.createElement('h3');
            header.textContent = group.displayName;
            groupDiv.appendChild(header);

            // Append available Q&A content for this group
            group.ids.forEach(id => {
                const qaBlock = document.getElementById(id);
                if (qaBlock) {
                    groupDiv.appendChild(qaBlock.cloneNode(true)); // Clone to avoid DOM reordering issues
                }
            });

            qaContainer.appendChild(groupDiv);
            qaContainer.appendChild(document.createElement('hr')); // Optional separator between groups
        }
    });
}

/**
 * Initialize responsive design adjustments for the category navigation grid.
 */
function handleResponsiveDesign() {
    const categoriesContainer = document.querySelector('.categories-container .categories');
    
    if (!categoriesContainer) return;

    const updateGridLayout = () => {
        const width = window.innerWidth;
        
        if (width <= 576) {
            categoriesContainer.style.gridTemplateColumns = 'repeat(1, minmax(200px, auto))';
        } else if (width <= 768) {
            categoriesContainer.style.gridTemplateColumns = 'repeat(2, minmax(200px, auto))';
        } else if (width <= 1200) {
            categoriesContainer.style.gridTemplateColumns = 'repeat(3, minmax(200px, auto))';
        } else {
            categoriesContainer.style.gridTemplateColumns = 'repeat(4, minmax(200px, auto))';
        }
    };

    updateGridLayout();
    
    window.addEventListener('resize', updateGridLayout);
}

/**
 * Initialize the navigation and grouping functions when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    generateCategoryNav();
    
    // Wait for qnaLoader.js to finish loading content before grouping blocks
    setTimeout(() => {
        groupQABlocks();
    }, 500); // Adjust delay as needed based on qnaLoader.js execution time

    handleResponsiveDesign();
});
