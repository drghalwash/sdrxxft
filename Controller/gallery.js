// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret (for password validation if needed)
const jwtSecret = process.env.JWT_SECRET;

// Utility: Validate Password (if you still need user auth)
const validatePassword = async (password) => {
  try {
    console.log('[Auth] Validating password...');
    const { data: passwords, error } = await supabase.from('passwords').select('password');

    if (error) throw new Error(`Password validation error: ${error.message}`);

    // Check password against stored, encrypted passwords (if applicable)
    return passwords.some((record) => {
      try {
        const decryptedPassword = jwt.verify(record.password, jwtSecret);
        return decryptedPassword === password;
      } catch (err) {
        console.error('Failed to decrypt password:', err.message);
        return false;
      }
    });
  } catch (error) {
    console.error('[Auth] Error validating password:', error.message);
    throw error;
  }
};

// Utility: Fetch Gallery Metadata by Slug
const fetchGalleryDataBySlug = async (slug) => {
    try {
      console.log(`[Gallery] Fetching gallery metadata by slug: ${slug}`);
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
  

// Utility: Utility: Fetch Gallery Metadata by slug
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
  

// Utility: Fetch Gallery Images by Gallery slug
const fetchGalleryImagesByGallerySlug = async (gallerySlug) => {
    try {
      console.log(`[Gallery] Fetching gallery images for gallery slug: ${gallerySlug}`);
      const { data, error } = await supabase
        .from('galleryimage')
        .select(`*, gallery(name, slug)`) // Fetch image details with gallery's name and slug
        .eq('gallery.slug', gallerySlug);
  
      if (error) {
        console.error(`[Gallery] Error fetching gallery images by slug: ${error.message}`);
        throw error;
      }
  
      if (!data || data.length === 0) {
        console.warn(`[Gallery] No images found for gallery slug: ${gallerySlug}`);
        return [];
      }
  
      return data.map(img => ({
        ...img,
        gallery: {
          name: img.gallery.name, // Extract gallery name
          slug: img.gallery.slug  // Extract gallery slug
        }
      }));
    } catch (error) {
      console.error('[Gallery] Error in fetchGalleryImagesByGallerySlug:', error.message);
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
          const rowType = acc.rowCount === 0 && acc.rows.length === 0 ?
              'first-row' :
              `row-${Math.floor(index / 4) + 1}`;
          acc.currentRow += createImageCard(image);
          acc.rowCount++;
          if (acc.rowCount === (rowType === 'first-row' ? 5 : 4) ||
              index === images.length - 1) {
              acc.rows.push(`<div class="custom-row ${rowType}">${acc.currentRow}</div>`);
              acc.currentRow = '';
              acc.rowCount = 0;
          }
          return acc;
      }, {
          rows: [],
          currentRow: '',
          rowCount: 0
      }).rows.join('');
  };
  

// Utility: Create Image Card HTML
const createImageCard = ({
    id,
    name,
    status,
    icon,
    gallery
}) => {
    const isPublic = status === 'Public';
    const publicImageUrl = `/gallery/public_images/${id}`;
    const privateAccessAction = `openModal('${id}')`;
    return `
      <div class="custom-div${isPublic ? '' : '-private'}" 
           onclick="${isPublic ? `window.location.href='${isPublic ? publicImageUrl : privateAccessAction}'` : privateAccessAction}">
        <img class="icons" 
             src="${icon ? `/images/gallery/${icon}` : '/images/default-icon.png'}" 
             alt="${name} icon">
        <p>${name}</p>
      </div>
    `;
};

/**
 * Controller: Index Page - Fetch gallery and render
 */
export const index = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log(`[Request] Gallery index initiated for ID: ${id}`);
        const [gallery, images, allGalleries] = await Promise.all([
            fetchGalleryDataBySlug(id),
            fetchGalleryImagesByGalleryId(id),
            supabase.from('gallery').select('*')
        ]);
        if (!gallery) {
            console.warn(`[Gallery] No gallery found with slug: ${id}`);
            return res.status(404).render('Pages/404', {
                error: 'Gallery not found'
            });
        }
        const rowsHtml = buildGalleryRows(images);
        res.render('Pages/gallery', {
            gallery,
            allGalleries: allGalleries.data,
            galleryImages: images,
            rowsHtml
        });
        console.log(`[Success] Rendered gallery index page for ID: ${id}`);
    } catch (error) {
        console.error('[Error] Index controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};

/**
 * Controller: Public Images Page - By Slug
 * @param {Object} req - Express request object. Includes slug in params.
 * @param {Object} res - Express response object.
 */
export const publicImages = async (req, res) => {
    try {
        const {
            id: imageId
        } = req.params;
        console.log(`[Request] Public images access for ID: ${imageId}`);
        if (!imageId) {
            console.warn('[Request] No imageId provided.');
            return res.status(400).render('Pages/404', {
                error: 'No image ID provided'
            });
        }
        const {
            data: imageSet,
            error
        } = await supabase
            .from('galleryimage')
            .select('*')
            .eq('id', imageId)
            .single();
        if (error) {
            console.error(`[Supabase] Error fetching galleryimage: ${error.message}`);
            return res.status(500).render('Pages/404', {
                error: 'Error fetching image from database'
            });
        }
        if (!imageSet) {
            console.warn(`[Gallery] No gallery found with slug: ${imageId}`);
            return res.status(404).render('Pages/404', {
                error: 'Gallery not found'
            });
        }
        const {
            data: allGalleries,
            error: galleryError
        } = await supabase.from('gallery').select('*');
        if (galleryError) {
            console.error(`[Supabase] Error fetching all galleries: ${galleryError.message}`);
            return res.status(500).render('Pages/404', {
                error: 'Error fetching galleries from database'
            });
        }
        res.render('Pages/gallery', {
            imageSet,
            allGalleries,
            firstImage: imageSet.images ?.[0],
            remainingImages: imageSet.images?.slice(1) || []
        });
        console.log(`[Success] Rendered public image page for ID: ${imageId}`);
    } catch (error) {
        console.error('[Error] Public Images controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};

/**
 * Controller: Private Images Page - Requires Password
 * @param {Object} req - Express request object. Includes slug and password in body.
 * @param {Object} res - Express response object.
 */
export const privateImages = async (req, res) => {
    try {
        const {
            id,
            password
        } = req.body;
        console.log(`[Request] Private images access attempt for ID: ${id}`);
        if (!id || !password) {
            console.warn('[Request] Missing id or password in request body.');
            return res.status(400).render('Pages/404', {
                error: 'Missing credentials'
            });
        }
        if (!(await validatePassword(password))) {
            console.warn('[Auth] Invalid password attempt.');
            return res.status(403).render('Pages/404', {
                error: 'Invalid credentials'
            });
        }
        const {
            data: imageSet,
            error
        } = await supabase
            .from('galleryimage')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error(`[Supabase] Error fetching private image: ${error.message}`);
            return res.status(500).render('Pages/404', {
                error: 'Error fetching image from database'
            });
        }
        if (!imageSet) {
            console.warn(`[Gallery] No image set found with slug: ${id}`);
            return res.status(404).render('Pages/404', {
                error: 'Image not found'
            });
        }
        const {
            data: allGalleries,
            error: galleryError
        } = await supabase.from('gallery').select('*');
        if (galleryError) {
            console.error(`[Supabase] Error fetching all galleries: ${galleryError.message}`);
            return res.status(500).render('Pages/404', {
                error: 'Error fetching galleries from database'
            });
        }
        res.render('Pages/gallery', {
            imageSet,
            allGalleries,
            firstImage: imageSet.images ?.[0],
            remainingImages: imageSet.images?.slice(1) || []
        });
        console.log(`[Success] Rendered private image page for ID: ${id}`);
    } catch (error) {
        console.error('[Error] Private Images controller:', error.message);
        res.status(500).render('Pages/404', {
            error: error.message
        });
    }
};

