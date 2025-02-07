import categoryConfig from './categoryConfig.js';

class CategoryRenderer {
    constructor(containerId = 'categories') {
        this.container = document.getElementById(containerId); // Use correct container ID
        if (!this.container) {
            console.error('Categories container not found');
            return;
        }
        this.init();
    }

    init() {
        this.render();
    }

    generateGroupHTML(group) {
        const categoriesHTML = group.categories.map(category => {
            const style = category.highlighted ? 'font-weight: bold; color: #007bff;' : '';
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
                <h3 class="group-title">${group.title}</h3>
                <div class="category-list">
                    ${categoriesHTML}
                </div>
            </div>
        `;
    }

    render() {
        try {
            const html = Object.values(categoryConfig.groups)
                .map(group => this.generateGroupHTML(group))
                .join('');
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
