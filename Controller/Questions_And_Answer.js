// Import MongoDB model
import Photo_Gallaries from "../DB Models/Photo_Gallary.js";

// Import Supabase client
import { createClient } from "@supabase/supabase-js";

// Supabase client setup
const supabaseUrl = "https://drwismqxtzpptshsqphb.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Controller function to fetch data
export const index = async (req, res) => {
  try {
    // Fetch data from MongoDB
    const Photo_Gallary = await Photo_Gallaries.find({}).lean();

    // Fetch zones from Supabase
    const { data: zones, error: zonesError } = await supabase.from("zones").select("*");
    if (zonesError) throw zonesError;

    // Fetch categories from Supabase
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*");
    if (categoriesError) throw categoriesError;

    // Fetch questions from Supabase
    const { data: questions, error: questionsError } = await supabase.from("questions").select("*");
    if (questionsError) throw questionsError;

    // Render the Handlebars template with data from both databases
    res.render("Pages/Questions_And_Answer", {
      Photo_Gallary, // MongoDB data
      zones,         // Supabase zones
      categories,    // Supabase categories
      questions,     // Supabase questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("Pages/404", { error });
  }
};
