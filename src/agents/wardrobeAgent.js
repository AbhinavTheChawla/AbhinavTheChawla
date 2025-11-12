import { callClaude } from './claudeAPI';

/**
 * Wardrobe specialist agent
 * Provides outfit suggestions, shopping advice, and wardrobe management recommendations
 *
 * @param {string} userQuery - The user's question or request
 * @param {Object} context - Full app context from store.getAllData()
 * @param {string} apiKey - Claude API key
 * @returns {Promise<string>} - Agent's response
 */
export const wardrobeAgent = async (userQuery, context, apiKey) => {
  try {
    // Extract relevant data
    const { wardrobe, blueprint } = context;

    // Build comprehensive prompt with context
    const prompt = `You are a professional wardrobe and style consultant. You have access to the user's complete wardrobe inventory and their life goals.

USER'S WARDROBE DATA:
${JSON.stringify(wardrobe.data, null, 2)}

USER'S WARDROBE CATEGORIES:
${wardrobe.categories.map(cat => cat.name).join(', ')}

USER'S WISHLIST:
${wardrobe.wishlist.length > 0 ? wardrobe.wishlist.join(', ') : 'Empty'}

USER'S LIFE GOALS & ACTIVITIES:
Current Activities: ${blueprint.lifeNow.sports || 'Not specified'}
Next Year Plans: ${blueprint.lifeNextYear.activities || 'Not specified'}
Career: ${blueprint.lifeNextYear.career || 'Not specified'}

USER'S QUESTION:
${userQuery}

INSTRUCTIONS:
1. Analyze their wardrobe inventory and understand what clothing items they own
2. Consider their life goals, activities, and career plans when making recommendations
3. Provide specific, actionable outfit suggestions using items they already own
4. If they need new items, suggest specific pieces that would complement their existing wardrobe
5. Consider the context of their question (work, casual, sports, etc.)
6. Be concise but helpful - aim for 2-4 paragraphs maximum
7. Reference specific items from their wardrobe when possible

Provide your wardrobe advice:`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callClaude(messages, 1500, apiKey);
    return response;
  } catch (error) {
    console.error('Error in wardrobeAgent:', error);
    throw error;
  }
};
