import categoryConfig from './categoryConfig.js';

class CategoryRenderer {
  constructor(containerId = 'categories') {
    // Use getElementById so that if your container has id="categories", it is selected properly.
    this.container = document.getElementById(containerId);
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
    // If there is a search input, set it up.
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // Use event delegation for click events on category items.
    this.container.addEventListener('click', (e) => {
      const categoryItem = e.target.closest('.category-item');
      if (categoryItem && categoryItem.dataset.categoryId) {
        this.handleCategoryClick(categoryItem.dataset.categoryId);
      }
    });
  }

  // Improved search: for each group, hide the group if none of its category items are visible.
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const groups = this.container.querySelectorAll('.category-group');
    
    groups.forEach(group => {
      const items = group.querySelectorAll('.category-item');
      let groupHasVisibleItem = false;
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) groupHasVisibleItem = true;
      });
      group.style.display = groupHasVisibleItem ? '' : 'none';
    });
  }

  // Returns the group header HTML using properties from the group configuration.
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

  // Generates the HTML for an individual category item.
  generateCategoryHTML(category) {
    // Example: apply special style to highlight certain categories.
    // Adjust this logic if you want different categories styled differently.
    const style = category.highlighted
      ? 'font-weight: bold; color: #007bff;'
      : '';
    
    return `
      <div class="category-item" data-category-id="${category.id}">
        <a href="#${category.id}" style="${style}">
          ${category.name}
        </a>
      </div>
    `;
  }

  // Handler for when a category is clicked.
  handleCategoryClick(categoryId) {
    console.log(`Category clicked: ${categoryId}`);
    // Add further navigation or analytics logic here if needed.
  }

  // Renders all groups and their category items into the container.
  render() {
    try {
      const html = Object.values(categoryConfig.groups)
        .map(group => `
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
