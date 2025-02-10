/********************************************
 * File: /js/categoryManager.js
 * Description: Manages category navigation and grouping of Q&A blocks.
 ********************************************/

// Central configuration for categories.
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

// Helper function to get friendly display text for a category ID.
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

/**
 * Generate dynamic category navigation.
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
 * Only groups with available Q&A content are displayed.
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

            // Create header for the group
            const header = document.createElement('h3');
            header.textContent = categoriesConfig[groupKey].displayName;
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
 * Initialize the navigation and grouping functions when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    generateCategoryNav();
    groupQABlocks();
});
