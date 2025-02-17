// Import MongoDB model
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";

// Import Supabase client
import { getZones, getCategories, getQuestions } from "../supabase/qa.js";

export const index = async (req, res) => {
  try {
    // Fetch data from MongoDB
    const Photo_Gallary = await Photo_Gallaries.find({}).lean();

    // Fetch data from Supabase
    const zones = await getZones();
    const categories = await getCategories();
    const questions = await getQuestions();

    // Render the Handlebars template with fetched data
    res.render("Pages/Questions_And_Answer", {
      Photo_Gallary, // MongoDB data for photo galleries
      zones,         // Supabase zones
      categories,    // Supabase categories
      questions,     // Supabase questions
    });
  } catch (error) {
    console.error("Error fetching Q&A data:", error.message);
    res.status(500).render("Pages/404", { error });
  }
};
