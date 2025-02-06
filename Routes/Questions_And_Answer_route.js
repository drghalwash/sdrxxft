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
const Qapartials = Object.values(categoriesConfig).reduce((partials, group) => {
  group.ids.forEach(id => {
    partials[id] = `Qapartials/${id}`; // Maps each category ID to its corresponding partial file path
  });
  return partials;
}, {});

router.get('/', (req, res) => {
    console.log('Rendering Q&A Page');
    console.log('categoriesConfig:', categoriesConfig);
    console.log('Qapartials:', Qapartials);

    res.render('Questions_And_Answer', {
        categoriesConfig,
        Qapartials: Qapartials,
        layout: 'main'
    });
});

export default router;
