// qa.js
import { createClient } from '@supabase/supabase-js';

// Environment validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches zones with error handling and timeout
 * @returns {Promise<Array>} Array of zones
 */
export const getZones = async () => {
    try {
        const { data, error } = await supabase
            .from('zones')
            .select('*')
            .timeout(5000);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch zones:', error.message);
        throw error;
    }
};

/**
 * Fetches categories with related zone information
 * @param {number} [zoneId] Optional zone ID to filter categories
 * @returns {Promise<Array>} Array of categories with zone info
 */
export const getCategories = async (zoneId = null) => {
    try {
        let query = supabase
            .from('categories')
            .select(`
                *,
                zones:zone_id (
                    name,
                    technical_id
                )
            `)
            .timeout(5000);

        if (zoneId) {
            query = query.eq('zone_id', zoneId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch categories:', error.message);
        throw error;
    }
};

/**
 * Fetches questions with category information
 * @param {string} [categoryTechnicalId] Optional category technical ID
 * @returns {Promise<Array>} Array of questions with category info
 */
export const getQuestions = async (categoryTechnicalId = null) => {
    try {
        let query = supabase
            .from('questions')
            .select(`
                *,
                categories:category_technical_id (
                    display_name,
                    technical_id,
                    zone_id
                )
            `)
            .order('sort_order', { ascending: true })
            .timeout(5000);

        if (categoryTechnicalId) {
            query = query.eq('category_technical_id', categoryTechnicalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch questions:', error.message);
        throw error;
    }
};

/**
 * Fetches popular questions from the view
 * @returns {Promise<Array>} Array of popular questions with category info
 */
export const getPopularQuestions = async () => {
    try {
        const { data, error } = await supabase
            .from('popular_questions')
            .select('*')
            .timeout(5000);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch popular questions:', error.message);
        throw error;
    }
};

/**
 * Fetches recently added categories from the view
 * @returns {Promise<Array>} Array of recent categories
 */
export const getRecentlyAddedCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('recently_added_categories')
            .select('*')
            .timeout(5000);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch recent categories:', error.message);
        throw error;
    }
};

/**
 * Fetches a single question by its ID
 * @param {number} questionId The question ID
 * @returns {Promise<Object>} Question object with category info
 */
export const getQuestionById = async (questionId) => {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select(`
                *,
                categories:category_technical_id (
                    display_name,
                    technical_id,
                    zone_id
                )
            `)
            .eq('id', questionId)
            .single()
            .timeout(5000);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Failed to fetch question ${questionId}:`, error.message);
        throw error;
    }
};

export default supabase;
