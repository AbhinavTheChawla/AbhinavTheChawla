import { callClaude } from './claudeAPI';

/**
 * Life planning specialist agent
 * Provides strategic advice on goals, habits, and life planning
 *
 * @param {string} userQuery - The user's question or request
 * @param {Object} context - Full app context from store.getAllData()
 * @returns {Promise<string>} - Agent's response
 */
export const lifePlanningAgent = async (userQuery, context) => {
  try {
    // Extract relevant data
    const { blueprint } = context;

    // Build comprehensive prompt with context
    const prompt = `You are a professional life coach and strategic advisor. You have access to the user's complete life blueprint including their current habits and future goals.

CURRENT LIFE (LIFE RN):
Training: ${blueprint.lifeNow.training || 'Not specified'}
Reading: ${blueprint.lifeNow.reading || 'Not specified'}
Sports: ${blueprint.lifeNow.sports || 'Not specified'}

Daily Practices:
${blueprint.lifeNow.practices?.map(p => `- ${p}`).join('\n') || 'None listed'}

Daily Goals:
${blueprint.lifeNow.dailyGoals?.map(g => `- ${g}`).join('\n') || 'None listed'}

FUTURE PLANS (LIFE NEXT YEAR):
Career: ${blueprint.lifeNextYear.career || 'Not specified'}
Reading: ${blueprint.lifeNextYear.reading || 'Not specified'}
Training: ${blueprint.lifeNextYear.training || 'Not specified'}
Activities: ${blueprint.lifeNextYear.activities || 'Not specified'}
Travel: ${blueprint.lifeNextYear.travel || 'Not specified'}

SIDE HUSTLES:
${blueprint.sideHustles?.map(h => `- ${h}`).join('\n') || 'None listed'}

SOCIAL MEDIA STRATEGY:
X (Twitter): ${blueprint.socialMedia.x || 'Not specified'}
TikTok: ${blueprint.socialMedia.tiktok || 'Not specified'}
Reddit: ${blueprint.socialMedia.reddit || 'Not specified'}
Instagram: ${blueprint.socialMedia.ig || 'Not specified'}
LinkedIn: ${blueprint.socialMedia.linkedin || 'Not specified'}
WhatsApp: ${blueprint.socialMedia.whatsapp || 'Not specified'}
Messenger: ${blueprint.socialMedia.messenger || 'Not specified'}

SUBSTANCES APPROACH:
Psychedelics: ${blueprint.substances.psychedelics || 'Not specified'}
Caffeine: ${blueprint.substances.caffeine || 'Not specified'}
Pouches: ${blueprint.substances.pouches || 'Not specified'}
Ketamine: ${blueprint.substances.ketamine || 'Not specified'}

USER'S QUESTION:
${userQuery}

INSTRUCTIONS:
1. Analyze their current habits, practices, and goals
2. Identify patterns, potential conflicts, or alignment between current and future plans
3. Provide strategic advice that bridges their current state with their aspirations
4. Consider the full context of their life - career, personal growth, activities, and habits
5. Be honest about potential challenges or areas needing more attention
6. Provide actionable recommendations they can implement immediately
7. Be concise but insightful - aim for 2-4 paragraphs maximum
8. Reference specific goals or practices when possible

Provide your life planning advice:`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callClaude(messages, 1500);
    return response;
  } catch (error) {
    console.error('Error in lifePlanningAgent:', error);
    throw error;
  }
};
