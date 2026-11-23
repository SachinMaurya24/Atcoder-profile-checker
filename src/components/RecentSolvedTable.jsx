import React, { useState } from 'react';
import { ExternalLink, Search, CheckCircle, Clock } from 'lucide-react';

export default function RecentSolvedTable({ recentSolved = [] }) {
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = recentSolved.filter(item => {
    const matchesText =
      item.title.toLowerCase().includes(filterText.toLowerCase()) ||
      item.id.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.contestId && item.contestId.toLowerCase().includes(filterText.toLowerCase()));

    const matchesCat =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesText && matchesCat;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Recently Solved Problems</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse and inspect your latest Accepted solutions with exact difficulty ratings
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search problem or contest..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-mono">
            {['ALL', 'Easy', 'Medium', 'Hard', 'Expert'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Contest</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">Solved Time</th>
              <th className="py-3 px-4 text-right">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.length > 0 ? (
              filtered.map(p => {
                const diffDisplay = p.difficulty !== null ? p.difficulty : 'Unrated';
                const dateStr = p.solvedAt ? new Date(p.solvedAt).toLocaleDateString() : '-';

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {p.index || '•'}
                      </span>
                      <span>{p.title || p.id}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">
                      {p.contestId?.toUpperCase() || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          backgroundColor: `${p.tierColor}20`,
                          color: p.tierColor,
                          border: `1px solid ${p.tierColor}50`
                        }}
                      >
                        {p.tierName} {diffDisplay}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.language ? p.language.split(' ')[0] : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5 pt-3.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {dateStr}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded transition-all text-[11px]"
                      >
                        Solve
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                  No problems match your current search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
