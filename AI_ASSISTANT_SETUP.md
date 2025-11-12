# AI Assistant Setup Guide

## The Problem
The AI Assistant was experiencing CORS errors when trying to call the Claude API directly from the browser. The error message was:
```
Failed to get response from Claude: Failed to fetch
```

## The Solution
We've implemented a backend proxy server that handles API calls server-side, bypassing CORS restrictions.

## How to Run the Application

### IMPORTANT: Use the correct command!

**✅ CORRECT:**
```bash
npm run dev
```

**❌ WRONG:**
```bash
npm run client  # This only starts the frontend!
vite            # This only starts the frontend!
```

### What `npm run dev` does:
- Starts the **backend proxy server** on `http://localhost:3001`
- Starts the **frontend React app** on `http://localhost:5173`
- Both run concurrently and are required for the AI Assistant to work

## Setup Steps

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Configure your API key**:
   - Click the ⚙️ settings icon in the AI Assistant
   - Enter your Claude API key from https://console.anthropic.com/
   - Click "Save"

5. **Test the AI Assistant**:
   - Try asking: "What should I wear today?"
   - You should see logs in your terminal showing the proxy server handling requests

## Troubleshooting

### If you see "Failed to fetch" error:

1. **Check if both servers are running:**
   - You should see TWO servers start when you run `npm run dev`:
     - `🚀 Proxy server running on http://localhost:3001`
     - `VITE ready in xxx ms` with `Local: http://localhost:5173/`

2. **Check the browser console (F12)**:
   - Look for error messages like "Cannot connect to proxy server"
   - Look for the log: `🔄 Calling proxy at: http://localhost:3001/api/claude`

3. **Check the terminal logs**:
   - When you send a message, you should see:
     - `📨 Received request to /api/claude`
     - `🔑 API key validated (present)`
     - `🚀 Calling Claude API...`
     - `✅ Successfully received response from Claude API`

4. **Verify the proxy is running:**
   - Open `http://localhost:3001/health` in your browser
   - You should see: `{"status":"ok","message":"Proxy server is running"}`

5. **Restart the application:**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

### If you see API errors:

1. **Check your API key:**
   - Make sure it starts with `sk-ant-`
   - Verify it's valid at https://console.anthropic.com/

2. **Check API limits:**
   - Ensure you have credits remaining in your Anthropic account
   - Check if you've hit rate limits

## Architecture

```
Browser (localhost:5173)
    ↓
    | HTTP POST to /api/claude
    ↓
Proxy Server (localhost:3001)
    ↓
    | HTTP POST with API key
    ↓
Claude API (api.anthropic.com)
```

The proxy server:
- Receives requests from the frontend
- Adds the API key to the request headers
- Forwards the request to Claude's API
- Returns the response back to the frontend

This setup keeps your API key secure and avoids CORS issues!

## Files Changed

- `server.js` - New Express proxy server
- `src/agents/claudeAPI.js` - Updated to use proxy endpoint
- `package.json` - Added dependencies and updated scripts
- `package-lock.json` - Dependency lock file

## Dependencies Added

- `express` - Web server framework
- `cors` - CORS middleware
- `concurrently` - Run multiple npm scripts simultaneously
