import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Active window: consider a visitor active if a ping was received within the last 60 seconds
const ACTIVE_WINDOW_MS = 60 * 1000;

// Determine persistence file path
const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', '.analytics.json')
  : path.join(process.cwd(), '.analytics.json');

// In-memory tracker store
class VisitorTracker {
  constructor() {
    this.uniqueVisitors = new Set();
    this.activeSessions = new Map(); // visitorId -> timestamp
    this.totalPageViews = 0;
    this.startedAt = Date.now();
    this.saveTimeout = null;

    this.loadFromDisk();

    // Periodic cleanup of inactive sessions every 30 seconds
    setInterval(() => this.pruneInactiveSessions(), 30 * 1000).unref?.();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.uniqueVisitors)) {
          this.uniqueVisitors = new Set(parsed.uniqueVisitors);
        }
        if (typeof parsed.totalPageViews === 'number') {
          this.totalPageViews = parsed.totalPageViews;
        }
      }
    } catch (err) {
      console.warn('[Tracker] Could not load persisted analytics data:', err.message);
    }
  }

  scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.saveToDisk();
    }, 2000);
  }

  saveToDisk() {
    try {
      const data = {
        uniqueVisitors: Array.from(this.uniqueVisitors),
        totalPageViews: this.totalPageViews,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // In serverless environments, writing to disk might fail silently or fail outside /tmp
      console.warn('[Tracker] Could not save analytics to disk:', err.message);
    }
  }

  pruneInactiveSessions() {
    const now = Date.now();
    for (const [id, lastSeen] of this.activeSessions.entries()) {
      if (now - lastSeen > ACTIVE_WINDOW_MS) {
        this.activeSessions.delete(id);
      }
    }
  }

  /**
   * Derive a stable visitor identifier from client payload or IP/User-Agent
   */
  getVisitorId(req, clientVisitorId) {
    if (clientVisitorId && typeof clientVisitorId === 'string' && clientVisitorId.length >= 8) {
      return clientVisitorId.slice(0, 64);
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : null) ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const ua = req.headers['user-agent'] || 'unknown';

    return crypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex').slice(0, 24);
  }

  /**
   * Record a heartbeat/ping from a visitor
   */
  recordPing(req, { visitorId: rawVisitorId, isNew = false } = {}) {
    const visitorId = this.getVisitorId(req, rawVisitorId);
    const now = Date.now();

    // Active session ping
    this.activeSessions.set(visitorId, now);

    // Track unique visitor
    const isFirstTime = !this.uniqueVisitors.has(visitorId);
    if (isFirstTime) {
      this.uniqueVisitors.add(visitorId);
      this.scheduleSave();
    }

    if (isNew) {
      this.totalPageViews++;
      this.scheduleSave();
    }

    this.pruneInactiveSessions();

    return this.getStats();
  }

  /**
   * Explicit sign-off when window closes / unloads
   */
  recordLeave(req, { visitorId: rawVisitorId } = {}) {
    const visitorId = this.getVisitorId(req, rawVisitorId);
    this.activeSessions.delete(visitorId);
    return this.getStats();
  }

  /**
   * Return aggregated statistics
   */
  getStats() {
    this.pruneInactiveSessions();
    return {
      activeUsers: this.activeSessions.size,
      uniqueVisitors: this.uniqueVisitors.size,
      totalPageViews: this.totalPageViews,
      serverTime: Date.now()
    };
  }
}

// Global singleton instance
const tracker = new VisitorTracker();
export default tracker;
