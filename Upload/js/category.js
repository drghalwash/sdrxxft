// Utility functions
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// CategoryManager handles fetching and processing categories
const CategoryManager = {
  config: {
    selectors: {
      container: '.categories-container',
      searchInput: '#categorySearch',
      groupContainer: '.category-group',
      categoryItem: '.category-item'
    },
    classes: {
      active: 'active',
      highlight: 'highlight'
    }
  },
  async init() {
    this.container = document.querySelector(this.config.selectors.container);
    this.searchInput = document.querySelector(this.config.selectors.searchInput);
    await this.loadCategories();
    this.setupEventListeners();
    // Uncomment if additional grouping is needed:
    // this.initializeGroups();
  },
  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      this.categories = this.processCategories(data);
      this.renderCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
      this.handleError(error);
    }
  },
  processCategories(data) {
    return data.reduce((acc, category) => {
      if (!category.group) return acc;
      if (!acc[category.group]) {
        acc[category.group] = {
          title: category.group,
          categories: []
        };
      }
      acc[category.group].categories.push({
        id: category.id,
        name: category.name,
        slug: generateSlug(category.name),
        partial: category.partial
      });
      return acc;
    }, {});
  },
  renderCategories() {
    // If you’re dynamically updating the DOM:
    // Loop over this.categories and create DOM elements as needed.
    // Otherwise, if Handlebars handles rendering, leave this empty.
  },
  handleError(error) {
    // Display an error message or fallback UI if desired.
    console.error('CategoryManager error:', error);
  },
  setupEventListeners() {
    // Set up event listeners (e.g., clicks on category items) if needed.
  }
};

// SearchHandler to filter categories based on input
const SearchHandler = {
  init() {
    this.searchInput = document.querySelector(CategoryManager.config.selectors.searchInput);
    if (!this.searchInput) return;
    this.bindSearchEvents();
  },
  bindSearchEvents() {
    this.searchInput.addEventListener('input', debounce(() => {
      const searchTerm = this.searchInput.value.toLowerCase().trim();
      this.performSearch(searchTerm);
    }, 300));
  },
  performSearch(term) {
    const items = document.querySelectorAll(CategoryManager.config.selectors.categoryItem);
    const groups = document.querySelectorAll(CategoryManager.config.selectors.groupContainer);
    groups.forEach(group => {
      let hasVisibleItems = false;
      const groupItems = group.querySelectorAll(CategoryManager.config.selectors.categoryItem);
      groupItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(term);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) hasVisibleItems = true;
      });
      group.style.display = hasVisibleItems ? '' : 'none';
    });
  }
};

// ContentLoader handles lazy loading using IntersectionObserver
const ContentLoader = {
  init() {
    this.setupLazyLoading();
    // Uncomment if additional intersection behavior is needed:
    // this.setupIntersectionObserver();
  },
  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadCategoryContent(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    document.querySelectorAll(CategoryManager.config.selectors.categoryItem)
      .forEach(item => observer.observe(item));
  },
  async loadCategoryContent(element) {
    const categoryId = element.dataset.category;
    if (!categoryId || element.dataset.loaded === 'true') return;
    try {
      const content = await this.fetchCategoryContent(categoryId);
      this.insertContent(element, content);
      element.dataset.loaded = 'true';
    } catch (error) {
      console.error(`Failed to load content for category ${categoryId}:`, error);
    }
  },
  async fetchCategoryContent(categoryId) {
    // Replace with actual API call logic if needed.
    return `<p>Content for ${categoryId}</p>`;
  },
  insertContent(element, content) {
    element.innerHTML += content;
  }
};

// StateManager to persist UI state between sessions
const StateManager = {
  state: {
    activeCategory: null,
    searchTerm: '',
    loadedCategories: new Set()
  },
  init() {
    this.loadState();
    // Optionally implement further state tracking.
  },
  loadState() {
    const savedState = localStorage.getItem('categoryState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.state = { ...this.state, ...parsedState };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  },
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    localStorage.setItem('categoryState', JSON.stringify(this.state));
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await CategoryManager.init();
    SearchHandler.init();
    ContentLoader.init();
    StateManager.init();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});
