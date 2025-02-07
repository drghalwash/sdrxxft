import categoryConfig from './categoryConfig.js';

class CategoryRenderer {
  constructor(containerId = 'categories') {
    this.container = document.querySelector('.categories');
    this.searchInput = document.getElementById('categorySearch');
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Categories container not found');
      return;
    }
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // Handle category clicks for analytics or navigation
    this.container.addEventListener('click', (e) => {
      const categoryItem = e.target.closest('.category-item');
      if (categoryItem) {
        const categoryId = categoryItem.dataset.categoryId;
        this.handleCategoryClick(categoryId);
      }
    });
  }

  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const categoryItems = this.container.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const isVisible = text.includes(searchTerm);
      item.style.display = isVisible ? '' : 'none';
      
      // Show/hide group headers based on visible categories
      const group = item.closest('.category-group');
      if (group) {
        const visibleItems = group.querySelectorAll('.category-item[style="display: "]');
        group.style.display = visibleItems.length ? '' : 'none';
      }
    });
  }

  generateGroupHeader(group) {
    return `
      <div class="group-title" style="
        background-color: ${group.bgColor};
        padding: 8px 15px;
        margin-bottom: 15px;
        border-radius: 4px;
        ${group.titleStyle}
      ">
        ${group.title}
      </div>
    `;
  }

  generateCategoryHTML(category) {
    const style = category.highlighted ? 
      'font-weight: bold; color: #007bff;' : '';
    
    return `
      <div class="category-item" data-category-id="${category.id}">
        <a href="#${category.id}" style="${style}">
          ${category.name}
        </a>
      </div>
    `;
  }

  handleCategoryClick(categoryId) {
    // Track category clicks or handle navigation
    console.log(`Category clicked: ${categoryId}`);
    // Add your analytics or navigation logic here
  }

  render() {
    try {
      const html = Object.entries(categoryConfig.groups)
        .map(([key, group]) => `
          <div class="category-group">
            ${this.generateGroupHeader(group)}
            <div class="category-list">
              ${group.categories
                .map(category => this.generateCategoryHTML(category))
                .join('')}
            </div>
          </div>
        `).join('');
      
      this.container.innerHTML = html;
    } catch (error) {
      console.error('Category rendering error:', error);
      this.container.innerHTML = `
        <div class="error-message" style="
          padding: 15px;
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 4px;
          color: #856404;
          text-align: center;
          margin: 10px 0;
        ">
          Unable to load categories. Please refresh the page.
        </div>
      `;
    }
  }
}

export default CategoryRenderer;
