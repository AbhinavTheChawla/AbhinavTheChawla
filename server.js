import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
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
    res.json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
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
