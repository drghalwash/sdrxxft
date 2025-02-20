// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Import JWT for password decryption
import jwt from 'jsonwebtoken';

// Utility: Validate Password
const validatePassword = async (password) => {
  try {
    console.log('[Auth] Validating password...');
    const { data: passwords, error } = await supabase.from('passwords').select('password');

    if (error) throw new Error(`Password validation error: ${error.message}`);

    return passwords.some((record) => {
      try {
        const decryptedPassword = jwt.verify(record.password, process.env.JWT_SECRET);
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

// Utility: Fetch Gallery Metadata
const fetchGalleryData = async (id) => {
  try {
    console.log(`[Gallery] Fetching metadata for gallery ID: ${id}`);
    const { data, error } = await supabase.from('gallery').select('*').eq('id', id).single();

    if (error) throw new Error(`Gallery metadata fetch error: ${error.message}`);
    return data;
  } catch (error) {
    console.error('[Gallery] Error fetching gallery metadata:', error.message);
    throw error;
  }
};

// Utility: Fetch Gallery Images
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

// Utility: Build HTML Rows for Gallery
const buildGalleryRows = (images) => {
  console.log('[UI] Generating gallery rows...');
  return images.reduce(
    (acc, image, index) => {
      const rowType =
        acc.rowCount === 0 && acc.rows.length === 0 ? 'first-row' : `row-${Math.floor(index / 4) + 1}`;

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
    },
    { rows: [], currentRow: '', rowCount: 0 }
  ).rows.join('');
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

// Controller: Index Page
export const index = async (req, res) => {
  try {
    console.log('[Request] Gallery index initiated...');
    const { id } = req.params;

    // Fetch gallery metadata, images, and all galleries concurrently
    const [gallery, images, allGalleries] = await Promise.all([
      fetchGalleryData(id),
      fetchGalleryImages(id),
      supabase.from('gallery').select('*'),
    ]);

    if (!allGalleries.data) throw new Error('Failed to fetch all galleries.');

    res.render('Pages/Gallery', {
      gallery,
      allGalleries: allGalleries.data,
      galleryImages: images,
      rowsHtml: buildGalleryRows(images),
    });
  } catch (error) {
    console.error('[Error] Index controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

// Controller: Public Images Page
export const publicImages = async (req, res) => {
  try {
    console.log('[Request] Public images access...');
    const { id } = req.params;

    // Fetch specific image set by ID
    const { data: imageSet, error } = await supabase.from('galleryimage').select('*').eq('id', id).single();
    if (error) throw new Error(`Public image fetch error: ${error.message}`);

    // Fetch all galleries for navigation
    const { data: allGalleries, error: galleryError } = await supabase.from('gallery').select('*');
    if (galleryError) throw new Error(`All galleries fetch error: ${galleryError.message}`);

    res.render('Pages/Gallery', {
      imageSet,
      allGalleries,
      firstImage: imageSet.images?.[0],
      remainingImages: imageSet.images?.slice(1) || [],
    });
  } catch (error) {
    console.error('[Error] Public Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};

// Controller: Private Images Page
export const privateImages = async (req, res) => {
  try {
    console.log('[Request] Private images access...');
    const { id, password } = req.body;

    // Validate password before granting access
    if (!(await validatePassword(password))) {
      console.warn('[Auth] Invalid password attempt.');
      return res.status(403).send();
    }

    // Fetch specific image set by ID
    const { data: imageSet, error } = await supabase.from('galleryimage').select('*').eq('id', id).single();
    if (error) throw new Error(`Private image fetch error: ${error.message}`);

    // Fetch all galleries for navigation
    const { data: allGalleries, error: galleryError } = await supabase.from('gallery').select('*');
    if (galleryError) throw new Error(`All galleries fetch error: ${galleryError.message}`);

    res.render('Pages/Gallery', {
      imageSet,
      allGalleries,
      firstImage: imageSet.images?.[0],
      remainingImages: imageSet.images?.slice(1) || [],
    });
  } catch (error) {
    console.error('[Error] Private Images controller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
