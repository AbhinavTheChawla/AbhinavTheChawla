import React, { useEffect } from 'react';
import useStore from '../store';
import WeeklyTracker from './WeeklyTracker';
import WeightGraph from './WeightGraph';

const Health = () => {
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  // Listen for cross-device sync events
  useEffect(() => {
    const handleSync = () => {
      reloadFromStorage();
    };

    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">
      {/* Weekly Tracker Section */}
      <WeeklyTracker />

      {/* Weight Tracking Section */}
      <WeightGraph />
    </div>
  );
};

export default Health;
