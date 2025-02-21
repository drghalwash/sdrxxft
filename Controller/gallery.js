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
 * Fetch gallery images by gallery slug.
 * @param {string} gallerySlug - The slug of the gallery.
 * @returns {Promise<Array<object>>} - Array of gallery images.
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
 * Validate if the provided password exists in the passwords table.
 * @param {string} password - The password to validate.
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise.
 */
const validatePassword = async (password) => {
    try {
        console.log('[Auth] Validating password...');
        const {
            data: passwords,
            error
        } = await supabase
            .from('"Passwords"') //Use public schema and add quot
            .select('password_hash') //To match correct column in db

        if (error) {
            console.error(`[Auth] Error fetching passwords: ${error.message}`);
            throw error;
        }
        //Now check if there exist a match password_hash === password , if so, return true;
        const isValid = passwords.some(p => p.password_hash === password);

        return isValid
    } catch (error) {
        console.error('[Auth] Error validating password:', error.message);
        return false;
    }
};

/**
 * Controller function to render the main gallery page.
 * Fetches gallery metadata and images based on the provided slug.
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

        // Separate images into public and private
        const publicImages = galleryImages.filter(img => img.status === 'Public');
        const privateImages = galleryImages.filter(img => img.status === 'Private');

        // Render the gallery page with fetched data
        res.render('Pages/gallery', {
            gallery,
            publicImages,
            privateImages,
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
 * Controller function to handle private images access.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const privateImages = async (req, res) => {
    try {
        const {
            id,
            password
        } = req.body;
        console.log(`[Request] Private images access attempt for ID: ${id}`);

        // Validate if the provided password exists in the passwords table
        const isValid = await validatePassword(password);

        if (!isValid) {
            console.warn('[Auth] Invalid password attempt.');
            return res.status(403).render('Pages/404', {
                error: 'Invalid password'
            });
        }

        const {
            data: galleryImage,
            error
        } = await supabase
            .from('galleryimage')
            .select(`*, gallery (name, slug)`)
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

        console.log(`[Success] Rendered private image page for ID: ${id}`);
        res.render('Pages/private_gallery', {
            galleryImage,
            /*, you can pass others parameters also*/
        });

    } catch (error) {
        console.error('[Error] Private Images controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};
