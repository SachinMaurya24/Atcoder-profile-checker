import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Award, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function getTierColor(rating) {
  if (rating < 400) return '#808080';
  if (rating < 800) return '#8b5a2b';
  if (rating < 1200) return '#22c55e';
  if (rating < 1600) return '#06b6d4';
  if (rating < 2000) return '#3b82f6';
  if (rating < 2400) return '#eab308';
  if (rating < 2800) return '#f97316';
  return '#ef4444';
}

export default function RatingChart({ history, currentRating, maxRating }) {
  const [showPerformance, setShowPerformance] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No rated contest history found for this user.
      </div>
    );
  }

  const labels = history.map(h => h.date || h.contestScreenName);
  const ratingData = history.map(h => h.newRating);
  const perfData = history.map(h => h.performance);

  const pointColors = history.map(h => getTierColor(h.newRating));

  // Background zones plugin
  const backgroundTiersPlugin = {
    id: 'backgroundTiers',
    beforeDraw: (chart) => {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.y) return;
      const { top, bottom, left, right } = chartArea;
      const yScale = scales.y;

      const tiers = [
        { min: 0, max: 400, color: 'rgba(128, 128, 128, 0.08)' },
        { min: 400, max: 800, color: 'rgba(139, 90, 43, 0.08)' },
        { min: 800, max: 1200, color: 'rgba(34, 197, 94, 0.08)' },
        { min: 1200, max: 1600, color: 'rgba(6, 182, 212, 0.08)' },
        { min: 1600, max: 2000, color: 'rgba(59, 130, 246, 0.08)' },
        { min: 2000, max: 2400, color: 'rgba(234, 179, 8, 0.08)' },
        { min: 2400, max: 2800, color: 'rgba(249, 115, 22, 0.08)' },
        { min: 2800, max: 4500, color: 'rgba(239, 68, 68, 0.08)' },
      ];

      ctx.save();
      for (const tier of tiers) {
        const yTop = yScale.getPixelForValue(tier.max);
        const yBottom = yScale.getPixelForValue(tier.min);

        // Clamp inside chartArea
        const actualTop = Math.max(top, Math.min(yTop, yBottom));
        const actualBottom = Math.min(bottom, Math.max(yTop, yBottom));

        if (actualTop < actualBottom) {
          ctx.fillStyle = tier.color;
          ctx.fillRect(left, actualTop, right - left, actualBottom - actualTop);
        }
      }
      ctx.restore();
    }
  };

  const datasets = [
    {
      label: 'Rating',
      data: ratingData,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      borderWidth: 2.5,
      pointBackgroundColor: pointColors,
      pointBorderColor: '#0f172a',
      pointBorderWidth: 1.5,
      pointRadius: history.length > 50 ? 3 : 5,
      pointHoverRadius: 7,
      tension: 0.15,
      fill: false
    }
  ];

  if (showPerformance) {
    datasets.push({
      label: 'Performance',
      data: perfData,
      borderColor: '#a855f7',
      borderDash: [5, 5],
      borderWidth: 1.5,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#0f172a',
      pointRadius: history.length > 50 ? 2 : 4,
      pointHoverRadius: 6,
      tension: 0.2,
      fill: false
    });
  }

  const chartData = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            const item = history[idx];
            return item.contestName || item.contestScreenName;
          },
          label: (context) => {
            const idx = context.dataIndex;
            const item = history[idx];
            if (context.dataset.label === 'Rating') {
              const deltaStr = item.delta >= 0 ? `+${item.delta}` : `${item.delta}`;
              return [
                ` Rating: ${item.newRating} (${deltaStr})`,
                ` Rank: #${item.place}`,
                ` Performance: ${item.performance}`
              ];
            }
            if (context.dataset.label === 'Performance') {
              return ` Performance: ${item.performance}`;
            }
            return '';
          },
          footer: (items) => {
            const idx = items[0].dataIndex;
            return `Date: ${history[idx].date}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)'
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 12,
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.4)'
        },
        ticks: {
          color: '#94a3b8',
          stepSize: 400,
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">Rating History</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track performance, rating changes, and rank progression across all official contests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              showPerformance
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {showPerformance ? 'Hide Performance Curve' : 'Show Performance Curve'}
          </button>
        </div>
      </div>

      {/* Tier Color Bar legend */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-4 text-[11px] font-mono font-medium text-center">
        <div className="bg-gray-500/15 border border-gray-500/30 text-gray-300 rounded py-1">Gray &lt;400</div>
        <div className="bg-amber-800/20 border border-amber-800/40 text-amber-500 rounded py-1">Brown 400+</div>
        <div className="bg-green-500/15 border border-green-500/30 text-green-400 rounded py-1">Green 800+</div>
        <div className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded py-1">Cyan 1200+</div>
        <div className="bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded py-1">Blue 1600+</div>
        <div className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded py-1">Yellow 2000+</div>
        <div className="bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded py-1">Orange 2400+</div>
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded py-1">Red 2800+</div>
      </div>

      <div className="h-[340px] w-full">
        <Line data={chartData} options={options} plugins={[backgroundTiersPlugin]} />
      </div>
    </div>
  );
}
