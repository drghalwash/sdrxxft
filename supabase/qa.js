// supabase/qa.js
import { createClient } from "@supabase/supabase-js";

// Supabase client setup
const supabaseUrl = "https://drwismqxtzpptshsqphb.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all zones from the database.
 */
export const getZones = async () => {
  const { data, error } = await supabase.from("zones").select("*");
  if (error) throw new Error(`Error fetching zones: ${error.message}`);
  return data;
};

/**
 * Fetch all categories from the database.
 */
export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw new Error(`Error fetching categories: ${error.message}`);
  return data;
};

/**
 * Fetch all questions from the database.
 */
export const getQuestions = async () => {
  const { data, error } = await supabase.from("questions").select("*");
  if (error) throw new Error(`Error fetching questions: ${error.message}`);
  return data;
};

export default supabase;
