import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Compass, RefreshCw } from 'lucide-react';
import ProfileBanner from './components/ProfileBanner';
import RatingChart from './components/RatingChart';
import ContestCard from './components/ContestCard';
import DifficultyBreakdown from './components/DifficultyBreakdown';
import ContestSourceAccuracy from './components/ContestSourceAccuracy';
import ActivityStreak from './components/ActivityStreak';
import RecentSolvedTable from './components/RecentSolvedTable';

export default function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [currentUser, setCurrentUser] = useState('tourist');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (handle) => {
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/${encodeURIComponent(handle.trim())}/full-data`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to fetch data for user "${handle}"`);
      }
      const data = await res.json();
      setUserData(data);
      setCurrentUser(handle.trim());
    } catch (err) {
      console.error(err);
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData('tourist');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      fetchUserData(usernameInput.trim());
    }
  };

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
                placeholder="Enter AtCoder Handle (e.g. tourist, chokudai)..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl py-2 pl-10 pr-24 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>

          {/* Quick Info */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => fetchUserData(currentUser)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
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
                onClick={() => fetchUserData('tourist')}
                className="mt-3 px-3 py-1 bg-rose-900/60 hover:bg-rose-900 border border-rose-700 rounded-lg text-xs font-bold text-rose-100 transition-all"
              >
                Load Default Profile (tourist)
              </button>
            </div>
          </div>
        )}

        {userData && !loading && (
          <>
            {/* 1. Profile Banner (Codeforces style) */}
            <ProfileBanner user={userData.user} />

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
