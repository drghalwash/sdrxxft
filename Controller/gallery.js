// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch gallery metadata by slug.
 */
export const fetchGalleryDataBySlug = async (slug) => {
  try {
    console.log(`[Gallery] Fetching metadata for gallery by slug: ${slug}`);
    const { data, error } = await supabase.from('gallery').select('*').eq('slug', slug).single();

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

/**
 * Fetch gallery images by gallery ID.
 */
export const fetchGalleryImagesByGalleryId = async (galleryId) => {
  try {
    console.log(`[Gallery] Fetching gallery images for gallery ID: ${galleryId}`);
    const { data, error } = await supabase.from('galleryimage').select('*').eq('gallery_id', galleryId);

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

/**
 * Controller: Index Page - Fetch gallery and render.
 */
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

    res.render('Pages/gallery', {
      gallery,
      allGalleries: allGalleries.data,
      galleryImages: images,
    });

    console.log(`[Success] Rendered gallery index page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Index controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

/**
 * Controller: Public Images Page - By ID.
 */
export const publicImages = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[Request] Public images access for ID: ${id}`);

    const { data: imageSet, error } = await supabase.from('galleryimage').select('*').eq('id', id).single();

    if (error || !imageSet) {
      console.warn(`[Gallery] No image set found with ID: ${id}`);
      return res.status(404).render('Pages/404', { error: 'Image not found' });
    }

    res.render('Pages/gallery', { imageSet });

    console.log(`[Success] Rendered public image page for ID: ${id}`);
  } catch (error) {
    console.error('[Error] Public Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

/**
 * Controller: Private Images Page - Requires Password.
 */
export const privateImages = async (req, res) => {
  try {
    const { id, password } = req.body;

    console.log(`[Request] Private images access attempt for ID: ${id}`);

    // Validate password logic here...

    res.render('Pages/gallery', {});
  } catch (error) {
    console.error('[Error] Private Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
