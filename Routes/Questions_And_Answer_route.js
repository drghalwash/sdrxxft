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
const texts = {
  rhinoplasty: "Rhinoplasty",
  facelift: "Facelift",
  eyelidlift: "Eyelid Lift",
  breastpsycho: "Breast Psychoanalysis",
  lollipoptechnique: "Lollipop Technique",
  miniinvasivebreast: "Mini-Invasive Breast Surgery",
  breastaugmentation: "Breast Augmentation"
};

// Generate partials mapping ONLY for existing files
const qaPartials = Object.values(categoriesConfig).reduce((partials, group) => {
  group.ids.forEach(id => {
    const partialPath = join(__dirname, 'Qapartials', `${id}.handlebars`);
    if (existsSync(partialPath)) {
      partials[id] = `Qapartials/${id}`;
    }
  });
  return partials;
}, {});


    router.get('/', (req, res) => {
  res.render('Questions_And_Answer', {
    categoriesConfig,
    texts,
    qaPartials,
    layout: 'main'
  });
});

export default router;
