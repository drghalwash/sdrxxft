// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch gallery metadata by slug.
 * @param {string} slug - The slug of the gallery.
 * @returns {Promise<object|null>} - The gallery metadata or null if not found.
 */
const fetchGalleryBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw new Error(`Error fetching gallery with slug "${slug}": ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error in fetchGalleryBySlug:', error.message);
    throw error;
  }
};

/**
 * Fetch all images for a gallery by its slug.
 * @param {string} gallerySlug - The slug of the gallery.
 * @returns {Promise<Array<object>>} - Array of images for the gallery.
 */
const fetchGalleryImagesBySlug = async (gallerySlug) => {
  try {
    const { data, error } = await supabase
      .from('galleryimage')
      .select('*')
      .eq('gallery.slug', gallerySlug);

    if (error) throw new Error(`Error fetching images for gallery "${gallerySlug}": ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error in fetchGalleryImagesBySlug:', error.message);
    throw error;
  }
};

/**
 * Fetch a specific image by its slug within a gallery.
 * @param {string} gallerySlug - The slug of the gallery.
 * @param {string} imageSlug - The slug of the image.
 * @returns {Promise<object|null>} - The image metadata or null if not found.
 */
const fetchImageBySlugs = async (gallerySlug, imageSlug) => {
  try {
    const { data, error } = await supabase
      .from('galleryimage')
      .select('*')
      .eq('gallery.slug', gallerySlug)
      .eq('slug', imageSlug)
      .single();

    if (error) throw new Error(`Error fetching image "${imageSlug}" in gallery "${gallerySlug}": ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error in fetchImageBySlugs:', error.message);
    throw error;
  }
};

/**
 * Validate password against the passwords table.
 * @param {string} password - The password to validate.
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise.
 */
const validatePassword = async (password) => {
  try {
    const { data, error } = await supabase
      .from('Passwords')
      .select('password_hash');

    if (error) throw new Error(`Error fetching passwords: ${error.message}`);

    return data.some((record) => record.password_hash === password); // Replace with hash comparison if needed.
  } catch (error) {
    console.error('[Auth] Error validating password:', error.message);
    throw error;
  }
};

/**
 * Controller function to render the main gallery page.
 * Displays all public and private images for a specific gallery.
 */
export const index = async (req, res) => {
  try {
    const { slug } = req.params;

    const [gallery, images] = await Promise.all([
      fetchGalleryBySlug(slug),
      fetchGalleryImagesBySlug(slug),
    ]);

    if (!gallery) return res.status(404).render('Pages/404', { error: 'Gallery not found' });

    const publicImages = images.filter((img) => img.status === 'Public');
    const privateImages = images.filter((img) => img.status === 'Private');

    res.render('Pages/gallery', { gallery, publicImages, privateImages });
  } catch (error) {
    console.error('[Error] Index controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

/**
 * Controller function to render a public image page.
 */
export const publicImage = async (req, res) => {
  try {
    const { gallery_slug, image_slug } = req.params;

    const image = await fetchImageBySlugs(gallery_slug, image_slug);

    if (!image || image.status !== 'Public') {
      return res.status(404).render('Pages/404', { error: 'Public image not found' });
    }

    res.render('Pages/public_image', { image });
  } catch (error) {
    console.error('[Error] Public Image controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

/**
 * Controller function to handle private image access with password validation.
 */
export const privateImage = async (req, res) => {
  try {
    const { gallery_slug, image_slug } = req.params;
    const { password } = req.body;

    const image = await fetchImageBySlugs(gallery_slug, image_slug);

    if (!image || image.status !== 'Private') {
      return res.status(404).render('Pages/404', { error: 'Private image not found' });
    }

    const isValidPassword = await validatePassword(password);

    if (!isValidPassword) {
      return res.status(403).render('Pages/403', { error: 'Invalid password' });
    }

    res.render('Pages/private_image', { image });
  } catch (error) {
    console.error('[Error] Private Image controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
