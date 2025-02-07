// ----- Add these lines at the very top of the file BEFORE any other import statements -----
// (Place these lines before the "import { Router } from 'express';" line)

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----- Continue with your existing imports -----
import { Router } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

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
  }
};

const texts = {
  rhinoplasty: "Rhinoplasty",
  facelift: "Facelift",
  eyelidlift: "Eyelid Lift",
  breastpsycho: "Breast Psychoanalysis",
  lollipoptechnique: "Lollipop Technique",
  miniinvasivebreast: "Mini-Invasive Breast Surgery",
  breastaugmentation: "Breast Augmentation",
  bodycontouring: "Body Contouring",
  fatgrafting: "Fat Grafting",
  tummytuck: "Tummy Tuck (Abdominoplasty)",
  brazilianbuttlift: "Brazilian Butt Lift (BBL)",
  mommyMakeover: "Mommy Makeover"
};

// 1. Generate complete list of all category IDs for navigation
const allCategoryIds = Object.values(categoriesConfig)
  .flatMap(group => group.ids);

// 2. Create partials map only for existing files
const qaPartials = Object.values(categoriesConfig)
  .reduce((partials, group) => {
    group.ids.forEach(id => {
      // Use __dirname now safely here
      const partialPath = join(__dirname, '../Qapartials', `${id}.handlebars`);
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
    allCategoryIds, // Pass all IDs regardless of partial existence
    layout: 'main'
  });
});

export default router;
