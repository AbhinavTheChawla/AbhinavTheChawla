import { callClaude } from './claudeAPI';

/**
 * Grooming specialist agent
 * Provides skincare, haircare, and grooming routine advice
 *
 * @param {string} userQuery - The user's question or request
 * @param {Object} context - Full app context from store.getAllData()
 * @param {string} apiKey - Claude API key
 * @returns {Promise<string>} - Agent's response
 */
export const groomingAgent = async (userQuery, context, apiKey) => {
  try {
    // Extract relevant data
    const { grooming, blueprint } = context;

    // Build comprehensive prompt with context
    const prompt = `You are a professional grooming and skincare consultant. You have access to the user's complete grooming routine and their life goals.

USER'S AM SKINCARE ROUTINE:
${grooming.am.map((item, i) => `${i + 1}. ${item[0]}: ${item[1]}`).join('\n')}

USER'S PM SKINCARE ROUTINE:
${grooming.pm.map((item, i) => `${i + 1}. ${item[0]}: ${item[1]}`).join('\n')}

SUPPLEMENTARY SKINCARE:
${grooming.supplementary.length > 0 ? grooming.supplementary.map(item => `- ${item[0]}: ${item[1]}`).join('\n') : 'None listed'}

PERFUMES:
${grooming.perfumes.map(item => `- ${item[0]}: ${item[1]}`).join('\n')}

SUPPLEMENTS:
${grooming.supplements.map(item => `- ${item[0]}: ${item[1]}`).join('\n')}

SHAVING/LASER PLAN:
${grooming.shaving.map(item => `- ${item[0]}: ${item[1]}`).join('\n')}

HAIR ROUTINE:
${grooming.hair.map(item => `- ${item[0]}: ${item[1]}`).join('\n')}

GROOMING WISHLIST:
${grooming.wishlist.length > 0 ? grooming.wishlist.map(item => `- ${item[0]} (${item[1]}) - Priority: ${item[2]}`).join('\n') : 'Empty'}

USER'S LIFE GOALS & CONTEXT:
Daily Practices: ${blueprint.lifeNow.practices?.join(', ') || 'Not specified'}
Activities: ${blueprint.lifeNow.sports || 'Not specified'}
Career: ${blueprint.lifeNextYear.career || 'Not specified'}

USER'S QUESTION:
${userQuery}

INSTRUCTIONS:
1. Analyze their current grooming routine and understand their skincare/haircare regimen
2. Consider their lifestyle, activities, and goals when making recommendations
3. Provide specific, actionable advice that complements their existing routine
4. If they need new products, suggest specific items that would work well with their current products
5. Consider timing, order of application, and potential interactions between products
6. Be concise but helpful - aim for 2-4 paragraphs maximum
7. Reference specific products from their routine when possible

Provide your grooming advice:`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callClaude(messages, 1500, apiKey);
    return response;
  } catch (error) {
    console.error('Error in groomingAgent:', error);
    throw error;
  }
};
