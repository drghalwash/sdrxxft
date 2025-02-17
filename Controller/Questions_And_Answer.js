// Import MongoDB model
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";

// Import Supabase functions
import {
  getZones,
  getCategories,
  getQuestions,
} from "../supabase/qa.js";

export const index = async (req, res) => {
  try {
    // Fetch data from MongoDB
    const Photo_Gallary = await Photo_Gallaries.find({}).lean();

    // Fetch data from Supabase
    const zones = await getZones();
    const categories = await getCategories();
    const questions = await getQuestions();

    // Organize categories under their respective zones
    const organizedZones = zones.map((zone) => ({
      ...zone,
      categories: categories.filter((category) => category.zone_id === zone.id),
    }));

    // Organize questions under their respective categories
    const organizedCategories = categories.map((category) => ({
      ...category,
      questions: questions.filter(
        (question) => question.category_id === category.id
      ),
    }));

    // Render the Handlebars template with fetched data
    res.render("Pages/Questions_And_Answer", {
      Photo_Gallary, // MongoDB photo gallery data
      zones: organizedZones, // Zones with nested categories
      categories: organizedCategories, // Categories with nested questions
      questions, // Flat list of questions (if needed elsewhere)
    });
  } catch (error) {
    console.error("Error in Qacontroller:", error.message);
    res.status(500).render("Pages/404", { error });
  }
};
