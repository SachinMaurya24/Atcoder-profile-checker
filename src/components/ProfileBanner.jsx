import React from 'react';
import { ExternalLink, Award, CheckCircle, TrendingUp, Hash, Star } from 'lucide-react';

export default function ProfileBanner({ user }) {
  const {
    id,
    currentRating,
    maxRating,
    tier,
    maxTier,
    acceptedCount,
    acceptedRank,
    ratedPointSum,
    ratedPointSumRank
  } = user;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative background glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: tier.color }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* User Identity */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wide border uppercase"
              style={{
                backgroundColor: `${tier.color}15`,
                borderColor: `${tier.color}40`,
                color: tier.color
              }}
            >
              {tier.rank} ({tier.kyu})
            </span>

            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }}></span>
              {tier.name} Tier
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: tier.color }}
          >
            {id}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <a
              href={`https://atcoder.jp/users/${id}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              Official Profile <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href={`https://kenkoooo.com/atcoder/#/user/${id}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              Kenkoooo Problems <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Rating and Solved Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 shrink-0">
          {/* Current Rating */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Rating
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: tier.color }}>
              {currentRating}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Current</div>
          </div>

          {/* Max Rating */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Max Rating
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: maxTier.color }}>
              {maxRating}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{maxTier.rank}</div>
          </div>

          {/* Solved Problems */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Problems Solved
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {acceptedCount}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {acceptedRank ? `Rank #${acceptedRank}` : 'AC Total'}
            </div>
          </div>

          {/* Rated Point Sum */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Point Sum
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300">
              {ratedPointSum ? (ratedPointSum / 1000).toFixed(0) + 'k' : '-'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {ratedPointSumRank ? `Rank #${ratedPointSumRank}` : 'Rated Points'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
