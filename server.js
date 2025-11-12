import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, max_tokens, apiKey } = req.body;

    // Validate API key
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        error: 'API key is required'
      });
    }

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

    // Handle error responses from Claude API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || `Claude API error: ${response.status} ${response.statusText}`
      });
    }

    // Forward successful response
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: `Failed to proxy request: ${error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Claude API proxy: http://localhost:${PORT}/api/claude`);
});
