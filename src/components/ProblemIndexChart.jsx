import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Hash, PieChart, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ProblemIndexChart({ problemStats }) {
  const {
    problemIndexCounts = {},
    contestTypeCounts = {},
    totalACSubmissions = 0,
    totalWASubmissions = 0,
    totalOtherSubmissions = 0,
    totalSubmissions = 0
  } = problemStats || {};

  // Standard ABC/ARC indices
  const targetIndices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Ex', 'Other'];
  const indexData = targetIndices.map(idx => problemIndexCounts[idx] || 0);

  const barChartData = {
    labels: targetIndices,
    datasets: [
      {
        label: 'Problems Solved',
        data: indexData,
        backgroundColor: [
          '#10b981', // A (Green)
          '#06b6d4', // B (Cyan)
          '#3b82f6', // C (Blue)
          '#6366f1', // D (Indigo)
          '#8b5cf6', // E (Purple)
          '#ec4899', // F (Pink)
          '#f43f5e', // G (Rose)
          '#f59e0b', // Ex (Amber)
          '#64748b'  // Other (Slate)
        ],
        borderRadius: 6,
        borderWidth: 0
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { family: "'JetBrains Mono', monospace", size: 11, weight: 'bold' }
        }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: {
          color: '#94a3b8',
          font: { family: "'JetBrains Mono', monospace", size: 10 }
        }
      }
    }
  };

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
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    cutout: '68%'
  };

  const acRate = totalSubmissions > 0 ? ((totalACSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Solved by Problem Level (A, B, C, D...) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Solved by Problem Index</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Tasks A through Ex</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Count of solved tasks categorized by contest problem position (e.g., A for introductory, F/G for advanced).
        </p>
        <div className="h-[220px] w-full">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div>

      {/* Contest Origin Distribution & AC Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Contest Source & Accuracy</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              {acRate}% AC Rate
            </span>
          </div>

          <div className="h-[170px] w-full mb-4">
            <Doughnut data={contestDoughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Verdict stats bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
          <div className="bg-slate-800/40 rounded-lg p-2">
            <p className="text-[10px] text-emerald-400 font-bold uppercase">Accepted</p>
            <p className="text-base font-bold font-mono text-white">{totalACSubmissions}</p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-2">
            <p className="text-[10px] text-rose-400 font-bold uppercase">Wrong Answer</p>
            <p className="text-base font-bold font-mono text-white">{totalWASubmissions}</p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-2">
            <p className="text-[10px] text-amber-400 font-bold uppercase">Total Subs</p>
            <p className="text-base font-bold font-mono text-white">{totalSubmissions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
