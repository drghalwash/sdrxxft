// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utility function to fetch gallery metadata by slug.
 *
 * @param {string} slug - The slug of the gallery.
 * @returns {Promise<object|null>} - A promise that resolves with the gallery metadata or null if not found.
 */
const fetchGalleryDataBySlug = async (slug) => {
    try {
        console.log(`[Gallery] Fetching metadata for gallery with slug: ${slug}`);
        const {
            data: gallery,
            error
        } = await supabase
            .from('gallery')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`[Gallery] Error fetching gallery metadata by slug: ${error.message}`);
            throw error;
        }

        return gallery;
    } catch (error) {
        console.error('[Gallery] Error in fetchGalleryDataBySlug:', error.message);
        throw error;
    }
};

/**
 * Utility function to fetch gallery images by gallery slug, including gallery details.
 *
 * @param {string} gallerySlug - The slug of the gallery.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of gallery images.
 */
const fetchGalleryImagesByGallerySlug = async (gallerySlug) => {
    try {
        console.log(`[Gallery] Fetching gallery images for gallery slug: ${gallerySlug}`);

        const {
            data: galleryImages,
            error
        } = await supabase
            .from('galleryimage')
            .select(`
                *,
                gallery (
                  name,
                  slug
                )
            `)
            .eq('gallery.slug', gallerySlug);

        if (error) {
            console.error(`[Gallery] Error fetching gallery images by slug: ${error.message}`);
            throw error;
        }

        if (!galleryImages || galleryImages.length === 0) {
            console.warn(`[Gallery] No images found for gallery slug: ${gallerySlug}`);
            return [];
        }

        return galleryImages.map(img => ({
            ...img,
            gallery: {
                name: img.gallery.name,
                slug: img.gallery.slug
            }
        }));
    } catch (error) {
        console.error('[Gallery] Error in fetchGalleryImagesByGallerySlug:', error.message);
        throw error;
    }
};

/**
 * Controller function to render the main gallery page.
 * Fetches gallery metadata and images based on the provided slug.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const index = async (req, res) => {
    try {
        const {
            slug
        } = req.params;
        console.log(`[Request] Gallery index initiated for slug: ${slug}`);

        // Fetch gallery metadata and images using the provided slug
        const [gallery, galleryImages] = await Promise.all([
            fetchGalleryDataBySlug(slug),
            fetchGalleryImagesByGallerySlug(slug),
        ]);

        if (!gallery) {
            console.warn(`[Gallery] No gallery found with slug: ${slug}`);
            return res.status(404).render('Pages/404', {
                error: 'Gallery not found'
            });
        }

        // Render the gallery page with fetched data
        res.render('Pages/gallery', {
            gallery,
            galleryImages,
        });

        console.log(`[Success] Rendered gallery index page for slug: ${slug}`);
    } catch (error) {
        console.error('[Error] Index controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};

/**
 * Controller function to display public images.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const publicImages = async (req, res) => {
    try {
        const {
            slug
        } = req.params;
        console.log(`[Request] Public images requested for gallery slug: ${slug}`);

        // Fetch public images for the gallery
        const publicImages = await fetchGalleryImagesByGallerySlug(slug);

        // If no public images found
        if (!publicImages || publicImages.length === 0) {
            console.warn(`[Gallery] No public images found for gallery slug: ${slug}`);
            return res.status(404).render('Pages/404', {
                error: 'No public images found for this gallery'
            });
        }

        // Render the gallery with public images
        res.render('Pages/gallery', {
            galleryImages: publicImages,
        });

        console.log(`[Success] Rendered public images for gallery slug: ${slug}`);
    } catch (error) {
        console.error('[Error] Public Images controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};

/**
 * Controller function to display private images after validating a password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const privateImages = async (req, res) => {
    try {
        const {
            id,
            password
        } = req.body;
        console.log(`[Request] Private images requested for image ID: ${id}`);

        // Here, you would include your logic to validate the password
        // For simplicity, I will use a placeholder
        if (password !== 'validPassword') {
            console.warn('[Auth] Invalid password attempt.');
            return res.status(403).render('Pages/404', {
                error: 'Invalid password'
            });
        }

        // Fetch gallery image with the given ID
        const {
            data: galleryImage,
            error
        } = await supabase
            .from('galleryimage')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`[Supabase] Error fetching galleryimage: ${error.message}`);
            return res.status(500).render('Pages/404', {
                error: 'Error fetching image from database'
            });
        }

        if (!galleryImage) {
            console.warn(`[Gallery] No gallery image found with slug: ${id}`);
            return res.status(404).render('Pages/404', {
                error: 'Image not found'
            });
        }

        // Render the gallery page with the private image
        res.render('Pages/gallery', {
            galleryImage
        });

        console.log(`[Success] Rendered private image page for ID: ${id}`);
    } catch (error) {
        console.error('[Error] Private Images controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};
