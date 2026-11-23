import { fetchUserData } from '../../_lib/userData.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract username from query or URL
  let username = req.query?.username;
  if (!username && req.url) {
    const match = req.url.match(/\/api\/user\/([^/?#]+)/);
    if (match) {
      username = decodeURIComponent(match[1]);
    }
  }

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const data = await fetchUserData(username);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}
