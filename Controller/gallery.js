// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility: Fetch Gallery Metadata by Slug
const fetchGalleryDataBySlug = async (slug) => {
  try {
    console.log(`[Gallery] Fetching metadata for gallery by slug: ${slug}`);
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`[Gallery] Error fetching gallery metadata by slug: ${error.message}`);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('[Gallery] Error in fetchGalleryDataBySlug:', error.message);
    throw error;
  }
};

// Utility: Fetch Gallery Images by Gallery ID
const fetchGalleryImagesByGalleryId = async (galleryId) => {
  try {
    console.log(`[Gallery] Fetching gallery images for gallery ID: ${galleryId}`);
    const { data, error } = await supabase
      .from('galleryimage')
      .select('*')
      .eq('gallery_id', galleryId);

    if (error) {
      console.error(`[Gallery] Error fetching gallery images: ${error.message}`);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('[Gallery] Error in fetchGalleryImagesByGalleryId:', error.message);
    throw error;
  }
};

// Utility: Build HTML Rows for Gallery Images
const buildGalleryRows = (images) => {
  console.log('[UI] Generating gallery rows...');
  if (!images || images.length === 0) {
    console.warn('[UI] No images to build gallery rows.');
    return '';
  }
  return images.reduce((acc, image, index) => {
    const rowType =
      acc.rowCount === 0 && acc.rows.length === 0
        ? 'first-row'
        : `row-${Math.floor(index / 4) + 1}`;
    acc.currentRow += createImageCard(image);
    acc.rowCount++;
    if (
      acc.rowCount === (rowType === 'first-row' ? 5 : 4) ||
      index === images.length - 1
    ) {
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

// Controller: Index Page - Fetch gallery and render
export const index = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Request] Gallery index initiated for ID: ${id}`);
    
    const [gallery, images, allGalleries] = await Promise.all([
      fetchGalleryDataBySlug(id),
      fetchGalleryImagesByGalleryId(id),
      supabase.from('gallery').select('*'),
    ]);

    if (!gallery) {
      console.warn(`[Gallery] No gallery found with slug: ${id}`);
      return res.status(404).render('Pages/404', { error: 'Gallery not found' });
    }

    const rowsHtml = buildGalleryRows(images);
    
    res.render('Pages/gallery', {
      gallery,
      allGalleries: allGalleries.data,
      galleryImages: images,
      rowsHtml,
    });
    
    console.log(`[Success] Rendered gallery index page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Index controller:', error.message);
    res.status(500).render('Pages/404', { error: error.message });
  }
};

// Controller: Public Images Page - By ID
export const publicImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[Request] Public images access for ID: ${id}`);
    
    const { data: imageSet, error } = await supabase
      .from('galleryimage')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !imageSet) {
      console.warn(`[Gallery] No image set found with ID: ${id}`);
      return res.status(404).render('Pages/404', { error: 'Image not found' });
    }

    const { data: allGalleries, error: galleryError } = await supabase.from('gallery').select('*');
    
    if (galleryError) throw new Error(`Error fetching all galleries: ${galleryError.message}`);

    res.render('Pages/gallery', {
      imageSet,
      allGalleries,
      firstImage: imageSet.images?.[0],
      remainingImages: imageSet.images?.slice(1) || [],
    });
    
    console.log(`[Success] Rendered public image page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Public Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
