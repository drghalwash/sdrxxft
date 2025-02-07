const categoryConfig = {
  groups: {
    face: {
      title: "Face",
      categories: [
        { id: "rhinoplasty", name: "Rhinoplasty" },
        { id: "facelift", name: "Facelift" },
        { id: "eyelidlift", name: "Eyelid Lift" }
      ]
    },
    breast: {
      title: "Breast",
      categories: [
        { id: "breastpsycho", name: "Breast:Thinking all night", highlighted: true },
        { id: "lollipoptechnique", name: "Breast Reduction:Lollipop technique", highlighted: true },
        { id: "miniinvasivebreast", name: "Thinking about mini invasive", highlighted: true },
        { id: "breastaugmentation", name: "Breast Augmentation" }
      ]
    },
    body: {
      title: "Body",
      categories: [
        { id: "bodycontouring", name: "Body Contouring" },
        { id: "fatgrafting", name: "Fat Grafting" },
        { id: "tummytuck", name: "Tummy Tuck (Abdominoplasty)" }
      ]
    }
  }
};

function generateCategoryHTML(category) {
  const style = category.highlighted ? 'font-weight: bold; color: #007bff;' : '';
  return `
    <div class="category-item">
      <a href="#${category.id}" style="${style}">${category.name}</a>
    </div>
  `;
}

function generateGroupHTML(groupKey, group) {
  return `
    <div class="category-group">
      <h3 class="group-title">${group.title}</h3>
      <div class="category-list">
        ${group.categories.map(cat => generateCategoryHTML(cat)).join('')}
      </div>
    </div>
  `;
}
