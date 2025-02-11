// File: /public/js/categoryNavStyles.js
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.categories-container .categories');
    if (!navContainer) return;

    // Apply grid styling
    navContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
        gap: 15px;
    `;

    // Style each category group
    document.querySelectorAll('.category-group').forEach(groupDiv => {
        groupDiv.style.cssText = `
            background-color: #ffffff;
            border: 2px solid #ffa500;
            border-radius: 8px;
            padding: 15px;
            break-inside: avoid;
        `;

        // Style the header
        const header = groupDiv.querySelector('h3');
        if (header) {
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
        }

        // Style category items and links
        groupDiv.querySelectorAll('.category-item').forEach(itemDiv => {
            itemDiv.style.cssText = `
                padding: 5px 0;
            `;

            const link = itemDiv.querySelector('a');
            if (link) {
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
            }
        });
    });

    // Add responsive behavior
    const updateGrid = () => {
        const width = window.innerWidth;
        navContainer.style.gridTemplateColumns =
            width < 576 ? 'repeat(1, minmax(200px, auto))' :
            width < 768 ? 'repeat(2, minmax(200px, auto))' :
            width < 1200 ? 'repeat(3, minmax(200px, auto))' :
            'repeat(4, minmax(200px, auto))';
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
});
