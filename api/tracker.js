import tracker from './_lib/tracker.js';

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryAction = req.query?.action;
  const payload = parseBody(req.body);
  const action = queryAction || payload.action || (req.method === 'GET' ? 'stats' : 'ping');

  try {
    if (action === 'leave') {
      const stats = tracker.recordLeave(req, payload);
      return res.status(200).json(stats);
    }

    if (action === 'stats' && req.method === 'GET') {
      const stats = tracker.getStats();
      return res.status(200).json(stats);
    }

    // Default to ping
    const stats = tracker.recordPing(req, payload);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Tracker error:', err);
    return res.status(500).json({ error: 'Failed to record tracking stats' });
  }
}
