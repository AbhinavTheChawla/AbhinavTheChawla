/**
 * Vercel Serverless Function for Claude API Proxy
 * This replaces the Express server (server.js) for production deployment
 */

export default async function handler(req, res) {
  // Log request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📨 Received request to /api/claude');

  try {
    const { messages, max_tokens, apiKey } = req.body;

    console.log(`📝 Request details: ${messages?.length || 0} messages, max_tokens: ${max_tokens || 1000}`);

    // Validate API key
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ No API key provided');
      return res.status(400).json({
        error: 'API key is required'
      });
    }

    console.log('🔑 API key validated (present)');
    console.log('🚀 Calling Claude API...');

    // Make request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1000,
        messages: messages
      })
    });

    console.log(`📡 Claude API responded with status: ${response.status}`);

    // Handle error responses from Claude API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Claude API error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || `Claude API error: ${response.status} ${response.statusText}`
      });
    }

    // Forward successful response
    const data = await response.json();
    console.log('✅ Successfully received response from Claude API');
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({
      error: `Failed to proxy request: ${error.message}`
    });
  }
}
