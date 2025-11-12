/**
 * Utility for making API calls to Claude
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Call Claude API with messages
 * @param {Array} messages - Array of message objects with role and content
 * @param {number} maxTokens - Maximum tokens for response (default 1000)
 * @returns {Promise<string>} - Claude's text response
 */
export const callClaude = async (messages, maxTokens = 1000) => {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': ANTHROPIC_VERSION,
        'x-api-key': '', // No API key needed in artifacts as per user requirements
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    const data = await response.json();

    // Extract text content from response
    if (data.content && data.content.length > 0) {
      return data.content[0].text;
    }

    throw new Error('No content in Claude response');
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to get response from Claude: ${error.message}`);
  }
};
