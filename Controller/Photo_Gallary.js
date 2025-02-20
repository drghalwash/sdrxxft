// Import Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI'
const supabase = createClient(supabaseUrl, supabaseKey)

// Import JWT for password decryption
import jwt from 'jsonwebtoken'

// Core Data Operations
const fetchGalleryData = async (id) => {
  try {
    console.log(`[Gallery] Fetching gallery metadata for ID: ${id}`)
    const { data, error } = await supabase
      .from('photo_gallary')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Gallery metadata error: ${error.message}`)
    return data
  } catch (error) {
    console.error('Error fetching gallery:', error)
    throw error
  }
}

const fetchGalleryImages = async (galleryId) => {
  try {
    console.log(`[Gallery] Fetching images for gallery ID: ${galleryId}`)
    const { data, error } = await supabase
      .from('photo_gallary_images')
      .select('*')
      .eq('photo_gallery_id', galleryId)

    if (error) throw new Error(`Image fetch error: ${error.message}`)
    return data
  } catch (error) {
    console.error('Error fetching images:', error)
    throw error
  }
}

const validatePassword = async (password) => {
  try {
    console.log('[Auth] Validating password')
    const { data, error } = await supabase
      .from('passwords')
      .select('password')

    if (error) throw new Error(`Password validation error: ${error.message}`)

    const isPasswordValid = data.some(record => {
      try {
        const decryptedPassword = jwt.verify(record.password, process.env.JWT_SECRET)
        return decryptedPassword === password
      } catch (err) {
        console.error('Failed to decrypt password:', err.message)
        return false
      }
    })

    return isPasswordValid
  } catch (error) {
    console.error('Error validating password:', error)
    throw error
  }
}

// Presentation Layer
const buildGalleryRows = (images) => {
  console.log('[UI] Generating gallery rows')
  return images.reduce((acc, image, index) => {
    const rowType = (acc.rowCount === 0 && acc.rows.length === 0) ? 
      'first-row' : 
      `row-${Math.floor(index/4) + 1}`
    
    acc.currentRow += createImageCard(image)
    acc.rowCount++

    if (acc.rowCount === (rowType === 'first-row' ? 5 : 4) || index === images.length - 1) {
      acc.rows.push(`<div class="custom-row ${rowType}">${acc.currentRow}</div>`)
      acc.currentRow = ''
      acc.rowCount = 0
    }
    return acc
  }, { rows: [], currentRow: '', rowCount: 0 }).rows.join('')
}

const createImageCard = ({ id, name, status, icon }) => {
  const isPublic = status === 'Public'
  return `
    <div class="custom-div${isPublic ? '' : '-private'}" 
         onclick="${isPublic ? `window.location.href='/Photo_Gallary/Public_images/${id}'` : `openModal('${id}')`}">
      <img class="icons" 
           src="${icon ? `/images/Photo Gallery/${icon}` : '/images/default-icon.png'}" 
           alt="${name} icon">
      <p>${name}</p>
    </div>
  `
}

// Controller Actions
export const index = async (req, res) => {
  try {
    console.log('[Request] Gallery index initiated')
    const { id } = req.params

    const [gallery, images, allGalleries] = await Promise.all([
      fetchGalleryData(id),
      fetchGalleryImages(id),
      supabase.from('photo_gallary').select('*')
    ])

    if (allGalleries.error) throw new Error(allGalleries.error.message)

    res.render('Pages/Photo_Gallary', {
      Photo_Gallary: gallery,
      Photo_Gallariess: allGalleries.data,
      Photo_Gallaries_images: images,
      rowsHtml: buildGalleryRows(images)
    })

  } catch (error) {
    console.error(`[Error] Index: ${error.message}`)
    res.status(500).render('Pages/404', { error })
  }
}

export const Public_images = async (req, res) => {
  try {
    console.log('[Request] Public images access')
    const { id } = req.params

    const { data: imageSet, error } = await supabase
      .from('photo_gallary_images')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    const allGalleries = await supabase.from('photo_gallary').select('*')
    if (allGalleries.error) throw new Error(allGalleries.error.message)

    res.render('Pages/Gallery', {
      Photo_Gallaries_images: imageSet,
      Photo_Gallariess: allGalleries.data,
      First_Image: imageSet.images?.[0],
      all_images: imageSet.images?.slice(1) || []
    })

  } catch (error) {
    console.error(`[Error] Public: ${error.message}`)
    res.status(500).render("Pages/404", { error })
  }
}

export const Private_images = async (req, res) => {
  try {
    console.log('[Request] Private access attempt')
    const { id, password } = req.body

    if (!await validatePassword(password)) {
      console.log('[Auth] Invalid password attempt')
      return res.status(403).send()
    }

    const { data: imageSet, error } = await supabase
      .from('photo_gallary_images')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    const allGalleries = await supabase.from('photo_gallary').select('*')
    if (allGalleries.error) throw new Error(allGalleries.error.message)

    res.render('Pages/Gallery', {
      Photo_Gallariess: allGalleries.data,
      Photo_Gallaries_images: imageSet,
      First_Image: imageSet.images?.[0],
      all_images: imageSet.images?.slice(1) || []
    })

  } catch (error) {
    console.error(`[Error] Private: ${error.message}`)
    res.status(500).render("Pages/404", { error })
  }
}
