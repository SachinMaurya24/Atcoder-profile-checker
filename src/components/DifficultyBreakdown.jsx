import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Layers, CheckCircle2, ShieldCheck, Flame, Compass } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DifficultyBreakdown({ problemStats }) {
  const {
    uniqueSolvedCount = 0,
    tierCounts = {},
    categoryCounts = {}
  } = problemStats || {};

  const tiers = [
    { name: 'Gray', label: '< 400', count: tierCounts.Gray || 0, color: '#808080' },
    { name: 'Brown', label: '400-799', count: tierCounts.Brown || 0, color: '#8b5a2b' },
    { name: 'Green', label: '800-1199', count: tierCounts.Green || 0, color: '#22c55e' },
    { name: 'Cyan', label: '1200-1599', count: tierCounts.Cyan || 0, color: '#06b6d4' },
    { name: 'Blue', label: '1600-1999', count: tierCounts.Blue || 0, color: '#3b82f6' },
    { name: 'Yellow', label: '2000-2399', count: tierCounts.Yellow || 0, color: '#eab308' },
    { name: 'Orange', label: '2400-2799', count: tierCounts.Orange || 0, color: '#f97316' },
    { name: 'Red', label: '2800+', count: tierCounts.Red || 0, color: '#ef4444' }
  ];

  const categories = [
    {
      name: 'Easy',
      range: '< 800 difficulty',
      count: categoryCounts.Easy || 0,
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      icon: CheckCircle2
    },
    {
      name: 'Medium',
      range: '800 - 1599 difficulty',
      count: categoryCounts.Medium || 0,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      icon: Compass
    },
    {
      name: 'Hard',
      range: '1600 - 2399 difficulty',
      count: categoryCounts.Hard || 0,
      color: 'from-blue-600 to-yellow-500',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      icon: ShieldCheck
    },
    {
      name: 'Expert',
      range: '2400+ difficulty',
      count: categoryCounts.Expert || 0,
      color: 'from-orange-500 to-red-600',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      icon: Flame
    }
  ];

  const chartData = {
    labels: tiers.map(t => `${t.name} (${t.label})`),
    datasets: [
      {
        label: 'Problems Solved',
        data: tiers.map(t => t.count),
        backgroundColor: tiers.map(t => t.color),
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: tiers.map(t => t.color + 'dd')
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const count = context.raw || 0;
            const pct = uniqueSolvedCount > 0 ? ((count / uniqueSolvedCount) * 100).toFixed(1) : 0;
            return ` ${count} solved (${pct}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Problem Difficulty Distribution</h3>
        </div>
        <div className="text-xs text-slate-400">
          Total Rated Solved: <span className="text-white font-mono font-bold">{uniqueSolvedCount}</span>
        </div>
      </div>

      {/* Easy / Medium / Hard / Expert Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {categories.map(cat => {
          const Icon = cat.icon;
          const pct = uniqueSolvedCount > 0 ? ((cat.count / uniqueSolvedCount) * 100).toFixed(1) : 0;
          return (
            <div
              key={cat.name}
              className={`bg-slate-800/50 border ${cat.borderColor} rounded-xl p-3.5 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${cat.textColor} uppercase tracking-wider flex items-center gap-1.5`}>
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{pct}%</span>
              </div>
              <div className="text-2xl font-black text-white font-mono mb-1">{cat.count}</div>
              <p className="text-[10px] text-slate-400 mb-2">{cat.range}</p>

              {/* Progress bar */}
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Difficulty Tier Bar Chart (Gray -> Red) */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Breakdown by Official Color Tiers</span>
          <span className="font-mono text-slate-500">Kenkoooo Difficulty Model</span>
        </div>
        <div className="h-[240px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
