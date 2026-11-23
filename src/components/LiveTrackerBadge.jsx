import React, { useState, useEffect, useRef } from 'react';
import { Users, Activity, Eye, Info, ChevronDown } from 'lucide-react';

function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return 'anon';
  try {
    let id = localStorage.getItem('atcoder_viz_uid');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('atcoder_viz_uid', id);
    }
    return id;
  } catch {
    return 'anon_' + Math.random().toString(36).slice(2);
  }
}

function checkIsNewSession() {
  if (typeof window === 'undefined') return false;
  try {
    const hasSeen = sessionStorage.getItem('atcoder_session_started');
    if (!hasSeen) {
      sessionStorage.setItem('atcoder_session_started', 'true');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function LiveTrackerBadge({ variant = 'navbar' }) {
  const [stats, setStats] = useState({
    activeUsers: 1,
    uniqueVisitors: 1,
    totalPageViews: 1,
    loading: true
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const sendPing = async (isNew = false) => {
    const visitorId = getOrCreateVisitorId();
    try {
      const res = await fetch('/api/tracker/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, isNew })
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          activeUsers: Math.max(1, data.activeUsers || 1),
          uniqueVisitors: Math.max(1, data.uniqueVisitors || 1),
          totalPageViews: Math.max(1, data.totalPageViews || 1),
          loading: false
        });
      }
    } catch (err) {
      // Silently catch to not disrupt main UX
      console.debug('[Tracker] Ping error:', err);
    }
  };

  useEffect(() => {
    // Initial ping (with isNewSession check)
    const isNew = checkIsNewSession();
    sendPing(isNew);

    // Heartbeat every 25 seconds
    const interval = setInterval(() => {
      sendPing(false);
    }, 25000);

    // Ping immediately when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendPing(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Send leave signal on tab close
    const handleUnload = () => {
      const visitorId = getOrCreateVisitorId();
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ visitorId })], { type: 'application/json' });
        navigator.sendBeacon('/api/tracker/leave', blob);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Click outside listener for dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-semibold">{stats.activeUsers}</span>
          <span className="text-slate-500">active now</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-semibold">{stats.uniqueVisitors.toLocaleString()}</span>
          <span className="text-slate-500">unique people opened</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300 font-semibold">{stats.totalPageViews.toLocaleString()}</span>
          <span className="text-slate-500">views</span>
        </div>
      </div>
    );
  }

  // Default navbar variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
        title="Live Traffic Analytics (Click for details)"
      >
        {/* Pulsing live dot for active users */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        {/* Active Users count */}
        <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
          {stats.activeUsers}
          <span className="hidden md:inline font-normal text-slate-400">online</span>
        </span>

        <span className="text-slate-700 font-bold hidden sm:inline">•</span>

        {/* Unique Visitors count */}
        <div className="flex items-center gap-1 text-slate-300">
          <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono font-bold text-slate-200">
            {stats.uniqueVisitors.toLocaleString()}
          </span>
          <span className="hidden lg:inline text-[11px] text-slate-400">unique</span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 hidden sm:block ${
            showDropdown ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown breakdown popover */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Audience Traffic
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Active Users Card */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Currently Active</p>
                <p className="text-[10px] text-slate-500">Browsing in the last 60s</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  {stats.activeUsers}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">users</span>
              </div>
            </div>

            {/* Unique Visitors Card */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Unique People</p>
                <p className="text-[10px] text-slate-500">Distinct devices / visitors</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-cyan-400">
                  {stats.uniqueVisitors.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">people</span>
              </div>
            </div>

            {/* Total Page Views Card */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Sessions</p>
                <p className="text-[10px] text-slate-500">Overall page visits recorded</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-indigo-400">
                  {stats.totalPageViews.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">views</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Updates every 25s automatically</span>
            <button
              onClick={() => sendPing(false)}
              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              Sync now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
