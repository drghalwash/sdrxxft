/********************************************
 * File: /config/categoryConfig.js
 * Description:
 *   Provides a single source of truth (configuration)
 *   for your categories grouping.
 *   Each group includes:
 *     - displayName: the name to display.
 *     - ids: an array of category IDs (each must match the id in your generated partials).
 ********************************************/
export const categoriesConfig = {
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
  },
  minimally_invasive: {
    displayName: 'Minimally Invasive',
    ids: ['botoxfillers', 'noninvasivecontouring']
  },
  other: {
    displayName: 'Other',
    ids: ['hairtransplant', 'skinresurfacing']
  }
};
