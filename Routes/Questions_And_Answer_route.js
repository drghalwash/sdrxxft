import { Router } from 'express';
const router = new Router();

// Central configuration for all category groups and IDs
const categoriesConfig = {
  face: {
    displayName: 'Face',
    ids: ["rhinoplasty", "facelift", "eyelidlift"]
  },
  breast: {
    displayName: 'Breast',
    ids: ["breastpsycho", "lollipoptechnique", "miniinvasivebreast", "breastaugmentation"]
  },
  body: {
    displayName: 'Body',
    ids: ["bodycontouring", "fatgrafting", "tummytuck", "brazilianbuttlift", "mommyMakeover"]
  },
  minimally_invasive: {
    displayName: 'Minimally Invasive',
    ids: ["botoxfillers", "noninvasivecontouring"]
  },
  other: {
    displayName: 'Other',
    ids: ["hairtransplant", "skinresurfacing"]
  }
};

// Dynamically generate the mapping for Q&A partials
const qaPartials = Object.values(categoriesConfig).reduce((partials, group) => {
  group.ids.forEach(id => {
    partials[id] = `Qapartials/${id}`; // Maps each category ID to its corresponding partial file path
  });
  return partials;
}, {});

router.get('/', (req, res) => {
  res.render('Questions_And_Answer', {
    categoriesConfig,
    // Pass the dynamic partials mapping
    Qapartials,
    layout: 'main' // The main layout file
  });
});
console.log('categoriesConfig:', categoriesConfig);
console.log('qaPartials:', qaPartials);


export default router;
