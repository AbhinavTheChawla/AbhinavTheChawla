/**
 * Utility for making API calls to Claude via proxy server
 */

// Use proxy server endpoint (defaults to localhost:3001 in development)
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001/api/claude';

/**
 * Call Claude API with messages via proxy server
 * @param {Array} messages - Array of message objects with role and content
 * @param {number} maxTokens - Maximum tokens for response (default 1000)
 * @param {string} apiKey - Claude API key
 * @returns {Promise<string>} - Claude's text response
 */
export const callClaude = async (messages, maxTokens = 1000, apiKey = '') => {
  // Check if API key is provided
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please configure your Claude API key in the settings.');
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: maxTokens,
        apiKey: apiKey
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Proxy error: ${response.status} ${response.statusText}`
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
