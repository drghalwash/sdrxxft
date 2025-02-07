// ---------- Begin Polyfill for __dirname ----------
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const filename = fileURLToPath(import.meta.url);
const __dirname = dirname(filename);
// ---------- End Polyfill for __dirname ----------

import Router from 'express';
import { existsSync } from 'fs';

const router = new Router();

// ---------- Centralized Categories Configuration ----------
const categoriesConfig = [
  {
    displayName: 'Face',
    ids: ['rhinoplasty', 'facelift', 'eyelidlift'],
  },
  {
    displayName: 'Breast',
    ids: ['breastpsycho', 'lollipoptechnique', 'miniinvasivebreast', 'breastaugmentation'],
  },
  {
    displayName: 'Body',
    ids: ['bodycontouring', 'fatgrafting', 'tummytuck', 'brazilianbuttlift', 'mommyMakeover'],
  },
];

// Mapping Display Names for Categories
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
  mommyMakeover: 'Mommy Makeover',
};

// ---------- Create a Flat List of All Category IDs ----------
const allCategoryIds = categoriesConfig.flatMap((group) => group.ids);

// ---------- Build a Map of Available Partial Templates ----------
const qaPartials = allCategoryIds.reduce((partials, id) => {
  const partialPath = join(__dirname, '../Qapartials', `${id}.handlebars`);
  
  // Check if the partial file exists
  if (existsSync(partialPath)) {
    partials[id] = `Qapartials/${id}`;
  } else {
    console.warn(`Partial not found for category ID: ${id}`);
    
    // Add a fallback entry for missing partials
    partials[id] = null; // Use null or a placeholder if desired
  }
  
  return partials;
}, {});

// ---------- QA Route Handler ----------
router.get('/', (req, res) => {
  res.render('QuestionsAndAnswer', {
    categoriesConfig, // Used in navigation iteration by group
    texts,            // Provides the display text for each category ID
    qaPartials,       // Contains only existing partials; others fall back
    allCategoryIds,   // Flat list for rendering every QA section
    layout: 'main',   // Main layout to use for rendering the page
  });
});

// Global Error Handler
router.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).render('error', {
    message: 'Internal Server Error',
    error: err, // Remove this in production for security reasons
  });
});

export default router;
