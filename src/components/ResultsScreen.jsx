import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RotateCcw, Target, TrendingUp } from 'lucide-react';
import { calculateConsistency } from '../utils/mistakeUtils';

const ResultsScreen = ({ results, onRetry, onGenerateDrill, targetedMistakes }) => {
  const {
    wpm,
    rawWpm,
    accuracy,
    totalTime,
    correctChars,
    totalChars,
    mistakeStats,
    wpmHistory,
  } = results;

  // Extract WPM values for consistency calculation
  const wpmValues = Array.isArray(wpmHistory) && wpmHistory.length > 0 && typeof wpmHistory[0] === 'object'
    ? wpmHistory.map(entry => entry.wpm)
    : wpmHistory;

  const consistency = calculateConsistency(wpmValues);

  // Prepare chart data - handle both old and new format
  const chartData = Array.isArray(wpmHistory) && wpmHistory.length > 0 && typeof wpmHistory[0] === 'object'
    ? wpmHistory
    : wpmHistory.map((wpm, index) => ({
        time: (index + 1) * 2,
        wpm,
      }));

  // Character breakdown
  const incorrectChars = totalChars - correctChars;
  const missedChars = 0; // Could calculate based on target length

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm font-medium opacity-90">WPM</div>
          <div className="text-4xl font-bold mt-2">{wpm}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm font-medium opacity-90">Raw WPM</div>
          <div className="text-4xl font-bold mt-2">{rawWpm}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm font-medium opacity-90">Accuracy</div>
          <div className="text-4xl font-bold mt-2">{accuracy}%</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm font-medium opacity-90">Consistency</div>
          <div className="text-4xl font-bold mt-2">{consistency}%</div>
        </div>
      </div>

      {/* WPM Graph */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">WPM Over Time</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="time"
                label={{ value: 'Seconds', position: 'insideBottom', offset: -5 }}
                stroke="#64748b"
              />
              <YAxis
                label={{ value: 'WPM', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-400 py-12">
            Test was too short to generate graph
          </div>
        )}
      </div>

      {/* Character Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Character Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{correctChars}</div>
            <div className="text-sm text-slate-600 mt-1">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{mistakeStats.submittedMistakes}</div>
            <div className="text-sm text-slate-600 mt-1">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{mistakeStats.backspacedMistakes}</div>
            <div className="text-sm text-slate-600 mt-1">Backspaced</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{mistakeStats.totalMistakes}</div>
            <div className="text-sm text-slate-600 mt-1">Total Errors</div>
          </div>
        </div>
      </div>

      {/* Top Mistakes */}
      {mistakeStats.topMistakes.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Top Mistakes</h3>
          <div className="space-y-2">
            {mistakeStats.topMistakes.map((mistake, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-mono text-sm">
                    {mistake.expected === ' ' ? 'space' : mistake.expected}
                    {' → '}
                    {mistake.actual === ' ' ? 'space' : mistake.actual}
                  </div>
                </div>
                <div className="text-slate-600 font-medium">{mistake.count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill Generation Section */}
      {mistakeStats.totalMistakes > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200">
          <div className="flex items-start gap-4">
            <div className="bg-violet-500 text-white p-3 rounded-lg">
              <Target size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Practice Your Weaknesses
              </h3>
              <p className="text-slate-600 mb-4">
                We detected {mistakeStats.totalMistakes} mistake{mistakeStats.totalMistakes !== 1 ? 's' : ''} in this test.
                Generate a targeted drill to practice your weak spots.
              </p>
              {targetedMistakes && targetedMistakes.length > 0 && (
                <div className="bg-white p-4 rounded-lg mb-4">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    This drill targets:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {targetedMistakes.map((mistake, index) => (
                      <span
                        key={index}
                        className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-mono"
                      >
                        {mistake.expected} → {mistake.actual} ({mistake.count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onGenerateDrill}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <TrendingUp size={20} />
                Generate Practice Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onRetry(false)}
          className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <RotateCcw size={20} />
          New Test
        </button>
        <button
          onClick={() => onRetry(true)}
          className="flex-1 bg-slate-600 text-white px-6 py-4 rounded-xl hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <RotateCcw size={20} />
          Retry Same Text
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
