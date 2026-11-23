import React, { useState, useMemo } from 'react';
import { Flame, Calendar, ExternalLink, CheckCircle2, XCircle, Clock, Info, Check } from 'lucide-react';

export default function ActivityStreak({ streak }) {
  const { currentStreak = 0, maxStreak = 0, activityByDate = {}, dailySubmissions = {} } = streak || {};

  // Build last 20 weeks (140 days) heatmap grid for a wider, comprehensive view
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 139; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityByDate[dateStr] || 0;
      list.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay(),
        formattedDate: d.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      });
    }
    return list;
  }, [activityByDate]);

  // Find the most recent active day as initial selection
  const latestActiveDay = useMemo(() => {
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        return days[i];
      }
    }
    return days[days.length - 1];
  }, [days]);

  // Selected or hovered day state
  const [activeDay, setActiveDay] = useState(null);

  // Use hovered/selected day or fall back to latest active day
  const displayedDay = activeDay || latestActiveDay;
  const submissionsForDay = (displayedDay && dailySubmissions[displayedDay.date]) || [];

  const getHeatmapColor = (count, isSelected) => {
    let base = 'bg-slate-800/60 border-slate-700/50';
    if (count > 0 && count <= 2) base = 'bg-emerald-900/70 border-emerald-700/70';
    else if (count <= 5 && count > 2) base = 'bg-emerald-700/85 border-emerald-500/85';
    else if (count <= 10 && count > 5) base = 'bg-emerald-500 border-emerald-400';
    else if (count > 10) base = 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/50';

    if (isSelected) {
      return `${base} ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-125 z-10`;
    }
    return base;
  };

  const acCount = submissionsForDay.filter(s => s.result === 'AC').length;
  const waCount = submissionsForDay.filter(s => s.result === 'WA').length;
  const otherCount = submissionsForDay.length - acCount - waCount;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm w-full">
      {/* Top Header: Title & Streaks */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Consistency & Activity Heatmap</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hover over any day on the heatmap to view all problems and submissions made on that date
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="text-xs">
              <span className="text-slate-400">Current Streak: </span>
              <span className="text-white font-bold font-mono">{currentStreak} days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
            <Flame className="w-4 h-4 text-rose-500" />
            <div className="text-xs">
              <span className="text-slate-400">Longest Streak: </span>
              <span className="text-white font-bold font-mono">{maxStreak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-6">
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {days.map(d => {
              const isSelected = displayedDay && displayedDay.date === d.date;
              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setActiveDay(d)}
                  onClick={() => setActiveDay(d)}
                  title={`${d.formattedDate}: ${d.count} submission(s)`}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer ${getHeatmapColor(
                    d.count,
                    isSelected
                  )}`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hover or tap any colored square to inspect submissions</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div>
            <span className="text-slate-500">More</span>
          </div>
        </div>
      </div>

      {/* Day Submissions Inspection Panel */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <h4 className="text-sm font-bold text-white font-mono">
              {displayedDay ? displayedDay.formattedDate : 'Select a Day'}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              {submissionsForDay.length} {submissionsForDay.length === 1 ? 'Submission' : 'Submissions'}
            </span>
            {acCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                {acCount} AC
              </span>
            )}
            {waCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                {waCount} WA
              </span>
            )}
            {otherCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                {otherCount} Other
              </span>
            )}
          </div>
        </div>

        {submissionsForDay.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {submissionsForDay.map(sub => {
              const isAC = sub.result === 'AC';
              const isWA = sub.result === 'WA';
              const verdictBg = isAC
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isWA
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={sub.id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-black text-[11px] border flex items-center gap-1 ${verdictBg}`}
                    >
                      {isAC ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {sub.result}
                    </span>

                    <div>
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{sub.title || sub.problemId}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                        <span className="text-cyan-400 uppercase font-bold">{sub.contestId}</span>
                        <span>•</span>
                        <span>{sub.language ? sub.language.split(' ')[0] : 'Code'}</span>
                        {sub.executionTime !== null && sub.executionTime !== undefined && (
                          <>
                            <span>•</span>
                            <span>{sub.executionTime} ms</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto font-mono">
                    {sub.difficulty !== null && sub.difficulty !== undefined ? (
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          backgroundColor: `${sub.tierColor}20`,
                          color: sub.tierColor,
                          border: `1px solid ${sub.tierColor}50`
                        }}
                      >
                        {sub.tierName} {sub.difficulty}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Unrated</span>
                    )}

                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{sub.time}</span>
                    </div>

                    <a
                      href={sub.submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded text-[11px] transition-all"
                    >
                      Code
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs font-mono">
            No submissions recorded on this date.
          </div>
        )}
      </div>
    </div>
  );
}
