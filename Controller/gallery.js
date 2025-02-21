// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility: Fetch Gallery Metadata by Slug
const fetchGalleryBySlug = async (slug) => {
  try {
    console.log(`[Gallery] Fetching gallery metadata for slug: ${slug}`);
    const { data, error } = await supabase.from('gallery').select('*').eq('slug', slug).single();

    if (error) throw new Error(`Gallery metadata fetch error: ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error fetching gallery metadata by slug:', error.message);
    throw error;
  }
};

// Utility: Fetch Gallery Images by Gallery ID
const fetchGalleryImages = async (galleryId) => {
  try {
    console.log(`[Gallery] Fetching images for gallery ID: ${galleryId}`);
    const { data, error } = await supabase.from('galleryimage').select('*').eq('gallery_id', galleryId);

    if (error) throw new Error(`Image fetch error: ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error fetching images:', error.message);
    throw error;
  }
};

// Utility: Generate HTML Rows for Gallery
const buildGalleryRows = (images) => {
  console.log('[UI] Generating gallery rows...');
  return images.reduce((acc, image, index) => {
    const rowType = acc.rowCount === 0 && acc.rows.length === 0 ? 'first-row' : `row-${Math.floor(index / 4) + 1}`;

    acc.currentRow += createImageCard(image);
    acc.rowCount++;

    if (acc.rowCount === (rowType === 'first-row' ? 5 : 4) || index === images.length - 1) {
      acc.rows.push(`<div class="custom-row ${rowType}">${acc.currentRow}</div>`);
      acc.currentRow = '';
      acc.rowCount = 0;
    }

    return acc;
  }, { rows: [], currentRow: '', rowCount: 0 }).rows.join('');
};

// Utility: Create Image Card HTML
const createImageCard = ({ id, name, status, icon }) => {
  const isPublic = status === 'Public';
  return `
    <div class="custom-div${isPublic ? '' : '-private'}" 
         onclick="${isPublic ? `window.location.href='/gallery/public_images/${id}'` : `openModal('${id}')`}">
      <img class="icons" 
           src="${icon ? `/images/gallery/${icon}` : '/images/default-icon.png'}" 
           alt="${name} icon">
      <p>${name}</p>
    </div>
  `;
};

// Controller: Index Page by Slug
export const index = async (req, res) => {
  try {
    const { id: slug } = req.params;

    // Fetch gallery metadata and images concurrently
    const [gallery, images] = await Promise.all([
      fetchGalleryBySlug(slug),
      fetchGalleryImages(slug),
    ]);

    res.render('Pages/gallery', {
      gallery,
      galleryImages: images,
      rowsHtml: buildGalleryRows(images),
    });

    console.log(`[Success] Rendered gallery page for slug: ${slug}`);
  } catch (error) {
    console.error('[Error] Index controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

// Controller: Public Images Page by ID
export const publicImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch specific image set by ID
    const { data: imageSet, error } = await supabase.from('galleryimage').select('*').eq('id', id).single();
    if (error) throw new Error(`Public image fetch error: ${error.message}`);

    res.render('Pages/public_image', { imageSet });
    
    console.log(`[Success] Rendered public image page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Public Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

// Controller: Private Images Page with Password Validation
export const privateImages = async (req, res) => {
  try {
    const { id, password } = req.body;

    // Validate password before granting access
    const isValidPassword = await validatePassword(password);
    if (!isValidPassword) return res.status(403).send();

    // Fetch specific private image set by ID
    const { data: imageSet, error } = await supabase.from('galleryimage').select('*').eq('id', id).single();
    if (error) throw new Error(`Private image fetch error: ${error.message}`);

    res.render('Pages/private_image', { imageSet });

    console.log(`[Success] Rendered private image page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Private Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
