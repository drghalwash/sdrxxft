// File: /Routes/api/categories.js
import express from 'express';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Reuse your existing categories configuration
const categoriesConfig = {
  face: { displayName: 'Face', ids: ['rhinoplasty', 'facelift', 'eyelidlift'] },
  breast: { displayName: 'Breast', ids: ['breastpsycho', 'lollipoptechnique', 'miniinvasivebreast', 'breastaugmentation'] }
};

router.get('/', (req, res) => {
  const categories = Object.entries(categoriesConfig).flatMap(([groupKey, group]) => 
    group.ids.map(id => ({
      id,
      name: id, // Add your display names if needed
      group: groupKey,
      partial: existsSync(join(__dirname, `../../Qapartials/${id}.handlebars`))
    }))
  );
  
  res.json(categories);
});

export default router;

