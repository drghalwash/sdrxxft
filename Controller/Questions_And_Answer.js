// Import Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all zones with their nested categories and questions.
 */
const getZonesWithDetails = async () => {
  try {
    console.log('Fetching zones...');
    const { data: zones, error: zonesError } = await supabase.from('zones').select('*');
    if (zonesError) throw new Error(`Error fetching zones: ${zonesError.message}`);
    console.log('Zones fetched:', zones);

    console.log('Fetching categories...');
    const { data: categories, error: categoriesError } = await supabase.from('categories').select('*');
    if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);
    console.log('Categories fetched:', categories);

    console.log('Fetching questions...');
    const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
    if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
    console.log('Questions fetched:', questions);

    // Organize data hierarchically
    const organizedZones = zones.map((zone) => ({
      ...zone,
      categories: categories
        .filter((category) => category.zone_id === zone.id)
        .map((category) => ({
          ...category,
          questions: questions.filter(
            (question) => question.category_technical_id === category.technical_id
          ),
        })),
    }));

    console.log('Organized Zones:', JSON.stringify(organizedZones, null, 2));
    return organizedZones;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Fetch all galleries from Supabase.
 */
const getPhotoGalleries = async () => {
  try {
    console.log('Fetching photo galleries from Supabase...');
    const { data: galleries, error } = await supabase.from('Photo_Gallary').select('*');
    if (error) throw new Error(`Error fetching photo galleries: ${error.message}`);
    console.log('Photo galleries fetched:', galleries);
    return galleries;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Q&A Controller
 */
export const index = async (req, res) => {
  try {
    // Fetch photo galleries and hierarchical zone data
    const [Photo_Gallary, organizedZones] = await Promise.all([
      getPhotoGalleries(),
      getZonesWithDetails(),
    ]);

    // Render the Handlebars template with fetched data
    res.render('Pages/Questions_And_Answer', {
      Photo_Gallary, // Supabase photo gallery data
      zones: organizedZones, // Zones with nested categories and questions
    });

    console.log('Data successfully sent to the template.');
  } catch (error) {
    console.error('Error in Qacontroller:', error.message);
    res.status(500).render('Pages/404', { error });
  }
};
