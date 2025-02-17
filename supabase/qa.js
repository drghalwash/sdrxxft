// supabase/qa.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drwismqxtzpptshsqphb.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
// ===================
//  Data Fetching Functions
// ===================

/**
 * @function getZones
 * @description Fetches all zones from the database.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of zones or rejects with an error.
 */
export const getZones = async () => {
    try {
        const { data, error } = await supabase
            .from('zones')
            .select('*');

        if (error) {
            throw new Error(`Error fetching zones: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw to handle it in the calling function
    }
};

/**
 * @function getCategories
 * @description Fetches all categories from the database.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of categories or rejects with an error.
 */
export const getCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            throw new Error(`Error fetching categories: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function getQuestions
 * @description Fetches all questions from the database.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of questions or rejects with an error.
 */
export const getQuestions = async () => {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*');

        if (error) {
            throw new Error(`Error fetching questions: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function getPopularQuestions
 * @description Fetches popular questions from the database view.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of popular questions or rejects with an error.
 */
export const getPopularQuestions = async () => {
    try {
        const { data, error } = await supabase
            .from('popular_questions') // Accessing the VIEW, not a table
            .select('*');

        if (error) {
            throw new Error(`Error fetching popular questions: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function getRecentlyAddedCategories
 * @description Fetches recently added categories from the database view.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of recently added categories or rejects with an error.
 */
export const getRecentlyAddedCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('recently_added_categories') // Accessing the VIEW, not a table
            .select('*');

        if (error) {
            throw new Error(`Error fetching recently added categories: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function getQuestionsByCategory
 * @description Fetches questions for a specific category.
 * @param {string} categoryTechnicalId - The technical ID of the category.
 * @returns {Promise<Array|Error>} A promise that resolves with an array of questions or rejects with an error.
 */
export const getQuestionsByCategory = async (categoryTechnicalId) => {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('category_technical_id', categoryTechnicalId);

        if (error) {
            throw new Error(`Error fetching questions for category ${categoryTechnicalId}: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default supabase;
