import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import * as taskService from '../services/taskService';

const getNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
};

const RANGES = [
  { label: '7d',  days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-clarity-card border border-clarity-border rounded-xl px-4 py-3 shadow-card-lg">
      <p className="text-xs font-semibold text-clarity-subtext mb-1">{label}</p>
      <p className="text-sm font-bold text-clarity-accent-light">
        {payload[0].value} task{payload[0].value !== 1 ? 's' : ''} completed
      </p>
    </div>
  );
};

const TaskStatsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRange, setActiveRange] = useState(7);

  const [dateRange, setDateRange] = useState({
    startDate: getNDaysAgo(7),
    endDate: getNDaysAgo(0),
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await taskService.getTaskStats(dateRange.startDate, dateRange.endDate);
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setError('Could not load activity data.');
      } finally {
        setLoading(false);
      }
    };
    if (dateRange.startDate && dateRange.endDate && dateRange.startDate <= dateRange.endDate) {
      fetchStats();
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleRangeClick = (days) => {
    setActiveRange(days);
    setDateRange({ startDate: getNDaysAgo(days), endDate: getNDaysAgo(0) });
  };

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setActiveRange(null);
  };

  const totalCompleted = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <div className="bg-clarity-card border border-clarity-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-clarity-border">
        <div>
          <h2 className="text-sm font-bold text-clarity-text">Completion Activity</h2>
          {totalCompleted > 0 && !loading && (
            <p className="text-xs text-clarity-muted mt-0.5">
              <span className="text-clarity-accent-light font-semibold">{totalCompleted}</span> tasks completed in this period
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick range pills */}
          <div className="flex gap-1" role="group" aria-label="Date range presets">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => handleRangeClick(r.days)}
                aria-pressed={activeRange === r.days}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-150 ${
                  activeRange === r.days
                    ? 'bg-clarity-accent/10 border-clarity-accent/30 text-clarity-accent-light'
                    : 'bg-clarity-surface border-clarity-border text-clarity-muted hover:text-clarity-subtext'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              name="startDate"
              aria-label="Start date"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="bg-clarity-surface border border-clarity-border rounded-lg px-2 py-1 text-xs text-clarity-subtext focus:outline-none focus:border-clarity-accent transition-colors cursor-pointer"
            />
            <span className="text-xs text-clarity-muted">–</span>
            <input
              type="date"
              name="endDate"
              aria-label="End date"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="bg-clarity-surface border border-clarity-border rounded-lg px-2 py-1 text-xs text-clarity-subtext focus:outline-none focus:border-clarity-accent transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Chart body */}
      <div className="px-5 py-5">
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg className="w-8 h-8 text-clarity-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-clarity-subtext font-medium">{error}</p>
            <button
              onClick={() => handleRangeClick(activeRange || 7)}
              className="mt-3 text-xs font-semibold text-clarity-accent-light hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading && data.length === 0 ? (
          <div className="space-y-2 py-4" aria-label="Loading chart" aria-busy="true">
            {[80, 60, 90, 70, 50].map((w, i) => (
              <div key={i} className="flex items-end gap-2 h-8">
                <div className="skeleton rounded" style={{ width: `${w}%`, height: '100%' }} />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-clarity-surface flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-clarity-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-clarity-subtext">No completions in this range</p>
            <p className="text-xs text-clarity-muted mt-1">Complete tasks or try a wider date range.</p>
          </div>
        ) : (
          <div className="h-52 w-full" role="img" aria-label="Task completion activity chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#2a2a2f"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#52525b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#52525b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Tasks Completed"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#chartGradient)"
                  dot={{ r: 3.5, strokeWidth: 2, fill: '#0f0f11', stroke: '#8b5cf6' }}
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#0f0f11', strokeWidth: 2 }}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatsChart;
