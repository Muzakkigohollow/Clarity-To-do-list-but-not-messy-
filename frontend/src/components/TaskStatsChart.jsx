import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as taskService from '../services/taskService';

const getNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
};

const TaskStatsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: getNDaysAgo(7), // default last 7 days
    endDate: getNDaysAgo(0) // today
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
        setError('Failed to fetch task statistics.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if both dates are valid and start <= end
    if (dateRange.startDate && dateRange.endDate && dateRange.startDate <= dateRange.endDate) {
      fetchStats();
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-clarity-text flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
          Completion Activity
        </h2>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
          <input 
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span>to</span>
          <input 
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : loading && data.length === 0 ? (
        <div className="text-gray-400 text-center py-10">Loading chart...</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded border border-dashed border-gray-200">
           <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
           <p className="text-gray-500 font-medium">No tasks completed in this date range.</p>
           <p className="text-gray-400 text-xs mt-1">Try expanding your dates to see activity.</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={20}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Tasks Completed" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#6366F1' }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TaskStatsChart;
