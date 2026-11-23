import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ContestSourceAccuracy({ problemStats }) {
  const {
    contestTypeCounts = {},
    totalACSubmissions = 0,
    totalWASubmissions = 0,
    totalOtherSubmissions = 0,
    totalSubmissions = 0
  } = problemStats || {};

  // Contest Type doughnut
  const contestLabels = ['ABC Solved', 'ARC Solved', 'AGC Solved', 'Other Solved'];
  const contestValues = [
    contestTypeCounts.ABC || 0,
    contestTypeCounts.ARC || 0,
    contestTypeCounts.AGC || 0,
    contestTypeCounts.Other || 0
  ];

  const contestDoughnutData = {
    labels: contestLabels,
    datasets: [
      {
        data: contestValues,
        backgroundColor: ['#06b6d4', '#f97316', '#ef4444', '#8b5cf6'],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          boxWidth: 12,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    cutout: '65%'
  };

  const acRate = totalSubmissions > 0 ? ((totalACSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Contest Solves & Verdict Accuracy</h3>
        </div>
        <span className="text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
          {acRate}% Lifetime AC Rate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Doughnut Chart */}
        <div className="h-[200px] w-full">
          <Doughnut data={contestDoughnutData} options={doughnutOptions} />
        </div>

        {/* Verdict Statistics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accepted
            </div>
            <p className="text-2xl font-black font-mono text-white">{totalACSubmissions}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{acRate}% of total</p>
          </div>

          <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
              <XCircle className="w-3.5 h-3.5" />
              Wrong Ans
            </div>
            <p className="text-2xl font-black font-mono text-white">{totalWASubmissions}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {totalSubmissions > 0 ? ((totalWASubmissions / totalSubmissions) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Total Subs
            </div>
            <p className="text-2xl font-black font-mono text-white">{totalSubmissions}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">All submissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
