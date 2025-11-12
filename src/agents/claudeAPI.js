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

  console.log(`🔄 Calling proxy at: ${PROXY_URL}`);

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

    console.log(`📡 Proxy responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Proxy error: ${response.status} ${response.statusText}`;
      console.error('❌ Proxy error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract text content from response
    if (data.content && data.content.length > 0) {
      console.log('✅ Successfully received response from Claude');
      return data.content[0].text;
    }

    throw new Error('No content in Claude response');
  } catch (error) {
    // Provide more specific error messages
    if (error.message === 'Failed to fetch') {
      console.error('❌ Cannot connect to proxy server. Is it running on port 3001?');
      throw new Error('Cannot connect to proxy server. Please ensure you started the app with "npm run dev" (not "npm run client")');
    }

    console.error('❌ Error calling Claude API:', error);
    throw new Error(`Failed to get response from Claude: ${error.message}`);
  }
};
