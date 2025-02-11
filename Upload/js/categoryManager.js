// File: /js/categoryManager.js

/***********************************************************************
 * File: /js/categoryManager.js
 * Description: Centralizes category configuration and display logic.
 * Features:
 *   - Dynamic category navigation generation
 *   - Group-based display logic
 *   - Responsive grid layout
 *   - Graceful handling of missing content
 ***********************************************************************/

const categoriesConfig = {
    face: {
        displayName: 'Face',
        ids: ['rhinoplasty', 'facelift', 'eyelidlift']
    },
    breast: {
        displayName: 'Breast',
        ids: ['breastpsycho', 'lollipoptechnique', 'miniinvasivebreast', 'breastaugmentation', 'pocketlift']
    },
    body: {
        displayName: 'Body',
        ids: ['bodycontouring', 'fatgrafting', 'tummytuck', 'brazilianbuttlift', 'mommyMakeover']
    },
    minimallyinvasive: {
        displayName: 'Minimally Invasive',
        ids: ['botoxfillers', 'noninvasivecontouring']
    },
    other: {
        displayName: 'Other',
        ids: ['hairtransplant', 'skinresurfacing']
    }
};

/**
 * Generates human-readable category link text from category IDs.
 * @param {string} id - The category ID.
 * @returns {string} - The corresponding category display name.
 */
function generateCategoryLinkText(id) {
    const categoryMap = {
        rhinoplasty: 'Rhinoplasty',
        facelift: 'Facelift',
        eyelidlift: 'Eyelid Lift',
        breastpsycho: 'Breast Thinking all night',
        lollipoptechnique: 'Breast Reduction Lollipop technique',
        miniinvasivebreast: 'Thinking about mini invasive',
        breastaugmentation: 'Breast Augmentation',
        pocketlift: 'Pocket Lift Breast Reduction',
        bodycontouring: 'Body Contouring',
        fatgrafting: 'Fat Grafting',
        tummytuck: 'Tummy Tuck Abdominoplasty',
        brazilianbuttlift: 'Brazilian Butt Lift BBL',
        mommyMakeover: 'Mommy Makeover',
        botoxfillers: 'Botox Dermal Fillers',
        noninvasivecontouring: 'Non-Invasive Body Contouring',
        hairtransplant: 'Hair Transplant',
        skinresurfacing: 'LASER SKIN RESURFACING'
    };
    return categoryMap[id] || id; // Returns id if display name not found
}

/**
 * Generates category navigation links based on the categoriesConfig.
 */
function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) return;

    navContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
        gap: 15px;
    `;

    Object.entries(categoriesConfig).forEach(([groupKey, group]) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';
        groupDiv.style.cssText = `
            background-color: #ffffff;
            border: 2px solid #ffa500;
            border-radius: 8px;
            padding: 15px;
            break-inside: avoid;
        `;

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

        group.ids.forEach(id => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'category-item';
            itemDiv.style.cssText = `
                padding: 5px 0;
            `;

            const link = document.createElement('a');
            link.href = `#${id}`; // Use the id as the anchor
            link.textContent = generateCategoryLinkText(id);
            link.style.cssText = `
                color: #495057;
                text-decoration: none;
                font-family: Verdana, sans-serif;
                font-size: 0.95em;
                transition: color 0.3s ease;
            `;
            link.addEventListener('mouseenter', () => {
                link.style.color = '#007bff';
                link.style.fontWeight = 'bold';
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = '#495057';
                link.style.fontWeight = 'normal';
            });
            itemDiv.appendChild(link);
            groupDiv.appendChild(itemDiv);
        });
        navContainer.appendChild(groupDiv);
    });
}

**
 * Renders a group of QA blocks by including the appropriate partial.
 * @param {string} groupKey - The key of the group in categoriesConfig.
 */
function renderQAGroup(groupKey) {
    const qaContainer = document.querySelector('.bsb-faq-3 .row');
    if (!qaContainer) return;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/Qapartials/${groupKey}.handlebars`, true); // Path to partial

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            // Success: Inject the partial's content into the container
            qaContainer.innerHTML = xhr.responseText;
        } else {
            // Handle error: Log it, display a message, etc.
            console.error(`Failed to load partial ${groupKey}.handlebars`);
            qaContainer.innerHTML = `<p>Failed to load content for ${categoriesConfig[groupKey].displayName}.</p>`;
        }
    };

    xhr.onerror = function () {
        console.error(`Error loading partial ${groupKey}.handlebars`);
        qaContainer.innerHTML = `<p>Error loading content for ${categoriesConfig[groupKey].displayName}.</p>`;
    };

    xhr.send();
}

/**
 * Handles responsive design for the category navigation grid.
 */
function handleResponsiveDesign() {
    const categories = document.querySelector('.categories-container .categories');
    if (!categories) return;

    const updateGrid = () => {
        const width = window.innerWidth;
        categories.style.gridTemplateColumns =
            width < 576 ? 'repeat(1, minmax(200px, auto))' :
            width < 768 ? 'repeat(2, minmax(200px, auto))' :
            width < 1200 ? 'repeat(3, minmax(200px, auto))' :
            'repeat(4, minmax(200px, auto))';
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
}

document.addEventListener('DOMContentLoaded', () => {
    generateCategoryNav();
    groupQABlocks();
    handleResponsiveDesign();

    // Initialize search functionality if available (safe to call even if not defined)
    if (window.initializeSearch) {
        window.initializeSearch(generateCategoryLinkText);
    }
});
