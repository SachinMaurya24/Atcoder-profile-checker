import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Compass, RefreshCw, Star } from 'lucide-react';
import ProfileBanner from './components/ProfileBanner';
import RatingChart from './components/RatingChart';
import ContestCard from './components/ContestCard';
import DifficultyBreakdown from './components/DifficultyBreakdown';
import ContestSourceAccuracy from './components/ContestSourceAccuracy';
import ActivityStreak from './components/ActivityStreak';
import RecentSolvedTable from './components/RecentSolvedTable';
import {
  getDefaultHandle,
  getSavedDefaultHandle,
  saveDefaultHandle,
  resetDefaultHandle,
  DEFAULT_HANDLE
} from './config';

export default function App() {
  const [defaultHandle, setDefaultHandleState] = useState(() => getSavedDefaultHandle());
  const [usernameInput, setUsernameInput] = useState('');
  const [currentUser, setCurrentUser] = useState(() => getDefaultHandle());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (handle) => {
    if (!handle || !handle.trim()) return;
    const cleanHandle = handle.trim();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/${encodeURIComponent(cleanHandle)}/full-data`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch data for user "${cleanHandle}"`);
      }
      const data = await res.json();
      setUserData(data);
      setCurrentUser(cleanHandle);

      // Keep URL search param in sync for easy sharing/bookmarking
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set('user', cleanHandle);
        window.history.replaceState(null, '', url.toString());
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialHandle = getDefaultHandle();
    fetchUserData(initialHandle);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      fetchUserData(usernameInput.trim());
      setUsernameInput('');
    }
  };

  const handleToggleDefault = (handleToToggle = currentUser) => {
    if (defaultHandle.toLowerCase() === handleToToggle.toLowerCase()) {
      resetDefaultHandle();
      setDefaultHandleState(DEFAULT_HANDLE);
    } else {
      saveDefaultHandle(handleToToggle);
      setDefaultHandleState(handleToToggle);
    }
  };

  const isCurrentUserDefault =
    currentUser.toLowerCase() === defaultHandle.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                AtCoder <span className="text-cyan-400">Visualizer</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono -mt-1">
                CF-Style Analytics & Problem Tracker
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search handle (default: ${defaultHandle})...`}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl py-2 pl-10 pr-24 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>

          {/* Quick Actions & Default Shortcut */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isCurrentUserDefault) {
                  fetchUserData(defaultHandle);
                }
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isCurrentUserDefault
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={`Default ID: "${defaultHandle}". Click to load your default profile.`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isCurrentUserDefault
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-500'
                }`}
              />
              <span className="hidden sm:inline text-slate-400">Default:</span>
              <span className="font-semibold text-slate-200">{defaultHandle}</span>
            </button>

            <button
              onClick={() => fetchUserData(currentUser)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh profile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin"></div>
              <Compass className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <p className="text-sm text-slate-400 font-mono animate-pulse">
              Fetching official AtCoder & Kenkoooo analytics for {currentUser}...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-rose-300 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-rose-200 mb-1">User Lookup Error</h3>
              <p className="text-xs text-rose-300/80">{error}</p>
              <button
                onClick={() => fetchUserData(defaultHandle)}
                className="mt-3 px-3 py-1 bg-rose-900/60 hover:bg-rose-900 border border-rose-700 rounded-lg text-xs font-bold text-rose-100 transition-all cursor-pointer"
              >
                Load Default Profile ({defaultHandle})
              </button>
            </div>
          </div>
        )}

        {userData && !loading && (
          <>
            {/* 1. Profile Banner (Codeforces style) */}
            <ProfileBanner
              user={userData.user}
              isDefault={isCurrentUserDefault}
              onToggleDefault={() => handleToggleDefault(currentUser)}
            />

            {/* 2. Contest Participation Card (ABC, ARC, AGC, AHC counts, Best perf) */}
            <ContestCard contestStats={userData.contestStats} />

            {/* 3. Rating History Chart with colored bands & performance curve */}
            <RatingChart
              history={userData.contestStats.history}
              currentRating={userData.user.currentRating}
              maxRating={userData.user.maxRating}
            />

            {/* 4. Problem Difficulty Distribution (Easy/Medium/Hard/Expert & Color Tiers) */}
            <DifficultyBreakdown problemStats={userData.problemStats} />

            {/* 5. Contest Source Breakdown & Accuracy */}
            <ContestSourceAccuracy problemStats={userData.problemStats} />

            {/* 6. Activity Streak, Interactive Heatmap & Day Submissions Inspector */}
            <ActivityStreak streak={userData.streak} />

            {/* 7. Recently Solved Problems List */}
            <RecentSolvedTable recentSolved={userData.problemStats.recentSolved} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          Data provided by <a href="https://atcoder.jp" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">AtCoder Official</a> &{' '}
          <a href="https://kenkoooo.com/atcoder" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">Kenkoooo AtCoder Problems API</a>.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Built with React, Tailwind CSS & Chart.js.
        </p>
      </footer>
    </div>
  );
}
