import React, { useEffect, useState } from 'react';
import useStore from '../store';
import WeightGraph from './WeightGraph';

const WeeklyTracker = () => {
  const weeklyTracker = useStore((state) => state.weeklyTracker);
  const updateWeeklyTracker = useStore((state) => state.updateWeeklyTracker);
  const [showHistory, setShowHistory] = useState(false);
  const [zone2Input, setZone2Input] = useState('');

  // Get Monday of current week
  const getMondayOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  };

  // Check if we need to reset for new week
  useEffect(() => {
    const checkWeekReset = () => {
      const currentMonday = getMondayOfWeek();
      const trackerMonday = weeklyTracker.currentWeek.weekStart;

      // If it's a new week, archive current week and reset
      if (trackerMonday && trackerMonday !== currentMonday) {
        // Only archive if there's data to save
        if (weeklyTracker.currentWeek.gymSessions > 0 || weeklyTracker.currentWeek.zone2Minutes > 0) {
          const newHistory = [
            {
              weekStart: trackerMonday,
              gymSessions: weeklyTracker.currentWeek.gymSessions,
              zone2Minutes: weeklyTracker.currentWeek.zone2Minutes
            },
            ...weeklyTracker.history
          ];

          updateWeeklyTracker({
            currentWeek: {
              weekStart: currentMonday,
              gymSessions: 0,
              zone2Minutes: 0
            },
            history: newHistory
          });
        } else {
          // Just reset without archiving empty week
          updateWeeklyTracker({
            ...weeklyTracker,
            currentWeek: {
              weekStart: currentMonday,
              gymSessions: 0,
              zone2Minutes: 0
            }
          });
        }
      } else if (!trackerMonday) {
        // Initialize the week if not set
        updateWeeklyTracker({
          ...weeklyTracker,
          currentWeek: {
            weekStart: currentMonday,
            gymSessions: 0,
            zone2Minutes: 0
          }
        });
      }
    };

    checkWeekReset();
    // Check every minute for new week
    const interval = setInterval(checkWeekReset, 60000);

    return () => clearInterval(interval);
  }, [weeklyTracker, updateWeeklyTracker]);

  const handleGymTap = () => {
    const currentSessions = weeklyTracker.currentWeek.gymSessions;
    const newSessions = currentSessions >= 3 ? 0 : currentSessions + 1;

    updateWeeklyTracker({
      ...weeklyTracker,
      currentWeek: {
        ...weeklyTracker.currentWeek,
        gymSessions: newSessions
      }
    });
  };

  const handleGymRemove = () => {
    const currentSessions = weeklyTracker.currentWeek.gymSessions;
    if (currentSessions > 0) {
      updateWeeklyTracker({
        ...weeklyTracker,
        currentWeek: {
          ...weeklyTracker.currentWeek,
          gymSessions: currentSessions - 1
        }
      });
    }
  };

  const handleZone2Add = () => {
    const minutes = parseInt(zone2Input);
    if (!isNaN(minutes) && minutes > 0) {
      updateWeeklyTracker({
        ...weeklyTracker,
        currentWeek: {
          ...weeklyTracker.currentWeek,
          zone2Minutes: weeklyTracker.currentWeek.zone2Minutes + minutes
        }
      });
      setZone2Input('');
    }
  };

  const gymSessions = weeklyTracker.currentWeek.gymSessions || 0;
  const zone2Minutes = weeklyTracker.currentWeek.zone2Minutes || 0;
  const zone2Target = 180;
  const zone2Percentage = Math.min((zone2Minutes / zone2Target) * 100, 100);

  const formatWeekDate = (weekStart) => {
    const date = new Date(weekStart);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-4 sm:mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-emerald-900 flex items-center gap-2">
          <span>💪</span>
          Weekly Tracker
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs sm:text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors px-3 py-1.5 bg-white/60 rounded-lg hover:bg-white/80"
        >
          {showHistory ? '← Back' : '📊 History'}
        </button>
      </div>

      {!showHistory ? (
        <div className="space-y-6">
          {/* Gym Tracker */}
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">
                🏋️ Gym Sessions
              </label>
              <span className="text-sm font-bold text-emerald-700">
                {gymSessions}/3
              </span>
            </div>

            {/* 3-part bar */}
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((session) => (
                <div
                  key={session}
                  className={`flex-1 h-8 rounded-lg transition-all cursor-pointer border-2 ${
                    gymSessions >= session
                      ? 'bg-emerald-500 border-emerald-600'
                      : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={handleGymTap}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGymTap}
                className="flex-1 text-xs sm:text-sm text-emerald-700 hover:text-emerald-900 font-medium py-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                + Add Session
              </button>
              <button
                onClick={handleGymRemove}
                className="flex-1 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                - Remove
              </button>
            </div>
          </div>

          {/* Zone 2 Cardio Tracker */}
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">
                ❤️ Zone 2 Cardio
              </label>
              <span className="text-sm font-bold text-blue-700">
                {zone2Minutes}/{zone2Target} min
              </span>
            </div>

            {/* Circle Progress */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - zone2Percentage / 100)}`}
                    className="text-blue-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {Math.round(zone2Percentage)}%
                    </div>
                    <div className="text-xs text-slate-500">complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input for adding minutes */}
            <div className="flex gap-2">
              <input
                type="number"
                value={zone2Input}
                onChange={(e) => setZone2Input(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleZone2Add()}
                placeholder="Minutes"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
              <button
                onClick={handleZone2Add}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Weight Tracking Graph */}
          <WeightGraph />
        </div>
      ) : (
        // History View
        <div className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            Historical performance over past weeks
          </div>

          {weeklyTracker.history.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No history yet. Complete your first week to see data here!
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyTracker.history.map((week, index) => (
                <div
                  key={index}
                  className="bg-white/60 rounded-lg p-4 border border-slate-200"
                >
                  <div className="text-xs font-semibold text-slate-500 mb-3">
                    Week of {formatWeekDate(week.weekStart)}
                  </div>

                  {/* Gym Sessions Chart */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700">🏋️ Gym</span>
                      <span className="text-sm font-bold text-slate-700">
                        {week.gymSessions}/3
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((session) => (
                        <div
                          key={session}
                          className={`flex-1 h-6 rounded ${
                            week.gymSessions >= session
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Zone 2 Chart */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700">❤️ Zone 2</span>
                      <span className="text-sm font-bold text-slate-700">
                        {week.zone2Minutes}/180 min
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-6">
                      <div
                        className="bg-blue-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.min((week.zone2Minutes / 180) * 100, 100)}%`
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {Math.round((week.zone2Minutes / 180) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyTracker;
