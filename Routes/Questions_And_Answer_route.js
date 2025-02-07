// ---------- Begin Polyfill for __dirname (Add these as the very first lines in this file) ----------
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ---------- End Polyfill for __dirname ----------

import { Router } from 'express';
import { existsSync } from 'fs';

const router = new Router();

// ---------- Centralized Categories Configuration ----------
// Update this object to add new groups or categories.
// Only one file needs to be maintained for both navigation and content.
const categoriesConfig = {
  face: {
    displayName: 'Face',
    ids: ['rhinoplasty', 'facelift', 'eyelidlift']
  },
  breast: {
    displayName: 'Breast',
    ids: ['breastpsycho', 'lollipoptechnique', 'miniinvasivebreast', 'breastaugmentation']
  },
  body: {
    displayName: 'Body',
    ids: ['bodycontouring', 'fatgrafting', 'tummytuck', 'brazilianbuttlift', 'mommyMakeover']
  }
};

// ---------- Mapping Display Names for Categories ----------
// Use this object to consistently show the category names
const texts = {
  rhinoplasty: 'Rhinoplasty',
  facelift: 'Facelift',
  eyelidlift: 'Eyelid Lift',
  breastpsycho: 'Breast Psychoanalysis',
  lollipoptechnique: 'Lollipop Technique',
  miniinvasivebreast: 'Mini-Invasive Breast Surgery',
  breastaugmentation: 'Breast Augmentation',
  bodycontouring: 'Body Contouring',
  fatgrafting: 'Fat Grafting',
  tummytuck: 'Tummy Tuck (Abdominoplasty)',
  brazilianbuttlift: 'Brazilian Butt Lift (BBL)',
  mommyMakeover: 'Mommy Makeover'
};

// ---------- Create a Flat List of All Category IDs ----------
// This list is used to render every Q&A content section.
const allCategoryIds = Object.values(categoriesConfig)
  .flatMap(group => group.ids);

// ---------- Build a Map of Available Partial Templates ----------
// For each category ID, check if a partial file exists in the Qapartials folder.
// This mapping is computed once at startup so missing partials don’t trigger errors.
const qaPartials = Object.values(categoriesConfig).reduce((partials, group) => {
  group.ids.forEach(id => {
    const partialPath = join(__dirname, '../Qapartials', `${id}.handlebars`);
    if (existsSync(partialPath)) {
      partials[id] = `Qapartials/${id}`;
    } else {
      console.warn(`Partial not found for category ID: ${id}`); // Log missing partials
    }
  });
  return partials;
}, {});



// ---------- Q&A Route Handler ----------
router.get('/', (req, res) => {
  res.render('Questions_And_Answer', {
    categoriesConfig,  // Used in navigation iteration by group
    texts,             // Provides the display text for each category ID
    qaPartials,        // Contains only existing partials (others fall back)
    allCategoryIds,    // Flat list for rendering every Q&A section
    layout: 'main'     // Main layout to use for rendering the page
  });
});
// Global Error Handler
router.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).render('error', {
    message: 'Internal Server Error',
    error: err // Remove `error: err` in production for security reasons
  });
});

export default router;
