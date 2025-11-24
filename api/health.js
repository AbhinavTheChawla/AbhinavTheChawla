/**
 * Vercel Serverless Function for Health Check
 * This endpoint is used by the frontend to verify the API is accessible
 */

export default async function handler(req, res) {
  // Log request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('✅ Health check requested');

  return res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}
