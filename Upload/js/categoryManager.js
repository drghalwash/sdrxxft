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
