// File: /public/js/categoryManager.js

import { categoriesConfig, categoryDisplayNames } from '../upload/js/categoryConfig.js';

function generateCategoryLinkText(id) {
    return categoryDisplayNames[id] || id;
}

function generateCategoryNav() {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) return;

    Object.entries(categoriesConfig).forEach(([groupKey, group]) => {
        const existingContent = group.ids.some(id => document.getElementById(id));
        if (!existingContent) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';
        
        const header = document.createElement('h3');
        header.textContent = group.displayName;
        groupDiv.appendChild(header);

        group.ids.forEach(id => {
            if (document.getElementById(id)) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'category-item';
                
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.textContent = generateCategoryLinkText(id);
                itemDiv.appendChild(link);
                groupDiv.appendChild(itemDiv);
            }
        });

        if (groupDiv.querySelectorAll('.category-item').length > 0) {
            navContainer.appendChild(groupDiv);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    generateCategoryNav();
    
    if (window.initializeSearch) {
        window.initializeSearch(generateCategoryLinkText);
    }
});
