import React, { useState } from 'react';
import useStore from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightGraph = () => {
  const weightData = useStore((state) => state.weightData);
  const updateWeightData = useStore((state) => state.updateWeightData);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const handleAddWeight = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0 && dateInput) {
      const newEntry = {
        date: dateInput,
        weight: weight
      };

      // Add new entry and sort by date
      const updatedEntries = [...weightData.entries, newEntry].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );

      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredEntries = updatedEntries.filter(entry =>
        new Date(entry.date) >= thirtyDaysAgo
      );

      updateWeightData({
        ...weightData,
        entries: filteredEntries
      });

      setWeightInput('');
      setDateInput(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDeleteEntry = (dateToDelete) => {
    const updatedEntries = weightData.entries.filter(entry => entry.date !== dateToDelete);
    updateWeightData({
      ...weightData,
      entries: updatedEntries
    });
  };

  // Calculate stats
  const getStats = () => {
    if (weightData.entries.length === 0) return null;

    const weights = weightData.entries.map(e => e.weight);
    const current = weights[weights.length - 1];
    const start = weights[0];
    const change = current - start;
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;

    return { current, start, change, min, max, avg };
  };

  const stats = getStats();

  // Format data for chart
  const chartData = weightData.entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    fullDate: entry.date
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">{payload[0].payload.fullDate}</p>
          <p className="text-sm text-blue-600">{payload[0].value.toFixed(1)} lbs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/60 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">
          📊 Weight Tracking (30 Days)
        </h4>
      </div>

      {/* Add Weight Entry */}
      <div className="flex gap-2">
        <input
          type="number"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddWeight()}
          placeholder="Weight (lbs)"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.1"
          min="0"
        />
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddWeight}
          className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {/* Apple Health Integration Note */}
      <div className="text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
        💡 <strong>Future Enhancement:</strong> Apple Health API integration for automatic weight sync
      </div>

      {weightData.entries.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No weight data yet. Add your first entry above!
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">Current</div>
                <div className="text-lg font-bold text-blue-900">{stats.current.toFixed(1)}</div>
              </div>
              <div className={`bg-gradient-to-br ${stats.change < 0 ? 'from-green-50 to-green-100 border-green-200' : stats.change > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-slate-50 to-slate-100 border-slate-200'} rounded-lg p-3 text-center border`}>
                <div className={`text-xs font-semibold mb-1 ${stats.change < 0 ? 'text-green-600' : stats.change > 0 ? 'text-red-600' : 'text-slate-600'}`}>Change</div>
                <div className={`text-lg font-bold ${stats.change < 0 ? 'text-green-900' : stats.change > 0 ? 'text-red-900' : 'text-slate-900'}`}>
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">Average</div>
                <div className="text-lg font-bold text-purple-900">{stats.avg.toFixed(1)}</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 text-center border border-slate-200">
                <div className="text-xs text-slate-600 font-semibold mb-1">Range</div>
                <div className="text-sm font-bold text-slate-900">{stats.min.toFixed(1)} - {stats.max.toFixed(1)}</div>
              </div>
            </div>
          )}

          {/* Interactive Chart */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{ value: 'lbs', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                {stats && <ReferenceLine y={stats.avg} stroke="#8b5cf6" strokeDasharray="3 3" label={{ value: 'Avg', fontSize: 10, fill: '#8b5cf6' }} />}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 mb-2">Recent Entries</div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {[...weightData.entries].reverse().map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
                >
                  <span className="text-slate-600">{entry.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">{entry.weight.toFixed(1)} lbs</span>
                    <button
                      onClick={() => handleDeleteEntry(entry.date)}
                      className="text-red-400 hover:text-red-600 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeightGraph;
