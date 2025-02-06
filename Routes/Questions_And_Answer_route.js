import { Router } from 'express';
const router = new Router();

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

// Dynamically generate partials mapping based on category IDs
const qaPartials = Object.values(categoriesConfig).reduce((partials, group) => {
  group.ids.forEach(id => {
    partials[id] = `Qapartials/${id}`; // Maps category ID to corresponding partial
  });
  return partials;
}, {});

router.get('/', (req, res) => {
  res.render('Questions_And_Answer', {
    categoriesConfig,
    qaPartials,
    layout: 'main' // Ensure the correct layout is used
  });
});

export default router;
