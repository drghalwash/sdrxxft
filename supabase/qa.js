// supabase/qa.js

{--import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd2lzbXF4dHpwcHRzaHNxcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTExNTIsImV4cCI6MjA1NTI4NzE1Mn0.V8C0Fk9u9PS_rc3Kc-X_n-KzStr--m14fKYw9b1BJSI'
const supabase = createClient(supabaseUrl, supabaseKey)
// ===================
//  Data Fetching Functions
// ===================


/**
 * Fetch all zones with their nested categories and questions.
 */
export const getZonesWithDetails = async () => {
  try {
    // Fetch zones
    const { data: zones, error: zonesError } = await supabase.from("zones").select("*");
    if (zonesError) throw new Error(`Error fetching zones: ${zonesError.message}`);

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*");
    if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase.from("questions").select("*");
    if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);

    // Organize data hierarchically
    const organizedZones = zones.map((zone) => ({
      ...zone,
      categories: categories
        .filter((category) => category.zone_id === zone.id)
        .map((category) => ({
          ...category,
          questions: questions.filter((question) => question.category_technical_id === category.technical_id),
        })),
    }));

    return organizedZones;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default supabase;--}
