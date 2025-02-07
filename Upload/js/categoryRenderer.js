import categoryConfig from './categoryConfig.js';

class CategoryRenderer {
    constructor(containerId = 'categories') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Categories container not found');
            return;
        }
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Categories container not found');
            return;
        }
        this.render();
    }

    generateGroupHTML(group) {
        const categoriesHTML = group.categories.map(category => {
            const style = category.highlighted ?
                'font-weight: bold; color: #007bff;' : '';
            return `
                <div class="category-item">
                    <a href="#${category.id}" style="${style}">
                        ${category.name}
                    </a>
                </div>
            `;
        }).join('');

        return `
            <div class="category-group">
                <h3 class="group-title" style="background-color: ${group.bgColor}; color: white; font-weight: bold;">
                    ${group.title}
                </h3>
                <div class="category-list">
                    ${categoriesHTML}
                </div>
            </div>
        `;
    }

    render() {
        try {
            let html = '';
            for (const key in categoryConfig.groups) {
                if (categoryConfig.groups.hasOwnProperty(key)) {
                    html += this.generateGroupHTML(categoryConfig.groups[key]);
                }
            }
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Error rendering categories:', error);
            this.container.innerHTML = `
                <div class="error-message">
                    Unable to load categories. Please refresh the page.
                </div>
            `;
        }
    }
}

export default CategoryRenderer;
