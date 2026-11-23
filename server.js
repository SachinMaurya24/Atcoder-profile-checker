import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchUserData, getRatingTier, getDifficultyCategory } from './api/_lib/userData.js';
import tracker from './api/_lib/tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Support sendBeacon text/plain payloads as JSON
app.use(express.text({ type: ['text/plain', 'application/json'] }));

// Helper to parse body whether json or string
function parseTrackerPayload(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body || {};
}

// Analytics & Tracker endpoints
app.all('/api/tracker/:action?', (req, res) => {
  const action = req.params.action || req.query.action || (req.method === 'GET' ? 'stats' : 'ping');
  const payload = parseTrackerPayload(req.body);

  if (action === 'leave') {
    const stats = tracker.recordLeave(req, payload);
    return res.json(stats);
  }

  if (action === 'stats' && req.method === 'GET') {
    return res.json(tracker.getStats());
  }

  // Default to recording a ping
  const stats = tracker.recordPing(req, payload);
  return res.json(stats);
});

// API endpoint to fetch full aggregated user stats
app.get('/api/user/:username/full-data', async (req, res) => {
  const { username } = req.params;
  try {
    const data = await fetchUserData(username);
    return res.json(data);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

// Re-export helpers for backward compatibility
export { getRatingTier, getDifficultyCategory };

// Configure Vite integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

// Only start when executed directly (not when imported)
if (process.argv[1] === __filename) {
  startServer();
}

export default app;
