// File: /js/categoryManager.js

/***********************************************************************
 * File: /js/categoryManager.js
 * Description: Centralizes category configuration and display logic.
 * Features:
 *   - Dynamic category navigation generation
 *   - Single partial include
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
            link.href = `/${groupKey}`; // Use the groupKey as the URL
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

/**
 * Loads content into the groupContent partial based on the category.
 */
function loadGroupContent(group) {
    const qaContainer = $('.bsb-faq-3 .row .col-12');
    if (!qaContainer.length) {
        console.error('QA container not found.');
        return;
    }

    // Sanitize group name to prevent path injection (Feature 1)
    const sanitizedGroup = encodeURIComponent(group);
    const partialPath = `/Qapartials/${sanitizedGroup}.handlebars`;

    $.get(partialPath)
    .done(function (data) {
        qaContainer.html(data);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Failed to load content for ' + sanitizedGroup + ': ' + textStatus + ' - ' + errorThrown);
        qaContainer.html('<p>Failed to load content for ' + sanitizedGroup + '.</p>');
    });
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

$(document).ready(() => {
    generateCategoryNav();
    handleResponsiveDesign();

    // Extract group from URL and load content on page load (Feature 2)
    const path = window.location.pathname;
    const group = path.split('/')[1] || 'breast'; // Default to 'breast' if no path
    loadGroupContent(group);

    // Handle navigation clicks (Feature 3)
    $('.categories-container .categories').on('click', 'a', function (e) {
        e.preventDefault(); // Prevent the default link behavior
        const group = this.getAttribute('href').substring(1); // Extract group from href
        loadGroupContent(group); // Load the new group content
    });

    // Initialize search functionality if available (safe to call even if not defined)
    if (window.initializeSearch) {
        window.initializeSearch(generateCategoryLinkText);
    }
});
