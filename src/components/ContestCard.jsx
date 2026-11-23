import React from 'react';
import { Trophy, Award, Flame, Star, Sparkles, BarChart2 } from 'lucide-react';
import { getTierColor } from './RatingChart';

export default function ContestCard({ contestStats }) {
  const {
    totalContests = 0,
    abcCount = 0,
    arcCount = 0,
    agcCount = 0,
    ahcCount = 0,
    otherContestsCount = 0,
    bestPerformance = 0,
    averagePerformance = 0,
    bestRank = 0,
    maxRatingIncrease = 0
  } = contestStats || {};

  const bestPerfColor = getTierColor(bestPerformance);
  const avgPerfColor = getTierColor(averagePerformance);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Contests & Participations</h3>
        </div>
        <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
          {totalContests} Rated Participations
        </span>
      </div>

      {/* Main Contest breakdown pills: ABC, ARC, AGC, AHC */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* ABC Card */}
        <div className="bg-slate-800/60 border border-cyan-500/30 hover:border-cyan-500/60 transition-all rounded-xl p-3.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">ABC Given</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{abcCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">AtCoder Beginner</p>
        </div>

        {/* ARC Card */}
        <div className="bg-slate-800/60 border border-orange-500/30 hover:border-orange-500/60 transition-all rounded-xl p-3.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">ARC Given</span>
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{arcCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">AtCoder Regular</p>
        </div>

        {/* AGC Card */}
        <div className="bg-slate-800/60 border border-red-500/30 hover:border-red-500/60 transition-all rounded-xl p-3.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">AGC Given</span>
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{agcCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">AtCoder Grand</p>
        </div>

        {/* AHC / Other */}
        <div className="bg-slate-800/60 border border-purple-500/30 hover:border-purple-500/60 transition-all rounded-xl p-3.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AHC & Other</span>
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{ahcCount + otherContestsCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Heuristic & Open</p>
        </div>
      </div>

      {/* Performance & Highlights grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Best Performance</p>
            <p className="text-base font-bold font-mono" style={{ color: bestPerfColor }}>
              {bestPerformance || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Average Perf.</p>
            <p className="text-base font-bold font-mono" style={{ color: avgPerfColor }}>
              {averagePerformance || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Best Global Rank</p>
            <p className="text-base font-bold font-mono text-amber-300">
              {bestRank > 0 ? `#${bestRank}` : '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Max Rating Jump</p>
            <p className="text-base font-bold font-mono text-emerald-400">
              {maxRatingIncrease > 0 ? `+${maxRatingIncrease}` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
