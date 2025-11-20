import React, { useEffect } from 'react';
import useStore from '../store';

const Blueprint = () => {
  // Get state and actions from Zustand store
  const data = useStore((state) => state.blueprintData);
  const updateBlueprint = useStore((state) => state.updateBlueprint);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  // Listen for cross-device sync events
  useEffect(() => {
    const handleSync = () => {
      reloadFromStorage();
    };

    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  const updateField = (field, value) => {
    const newData = {
      ...data,
      [field]: value
    };

    updateBlueprint(newData);
  };

  const updateArrayItem = (section, field, index, value) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: data[section][field].map((item, i) => i === index ? value : item)
      }
    };
    updateBlueprint(newData);
  };

  const addArrayItem = (section, field) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: [...data[section][field], '']
      }
    };
    updateBlueprint(newData);
  };

  const deleteArrayItem = (section, field, index) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: data[section][field].filter((_, i) => i !== index)
      }
    };
    updateBlueprint(newData);
  };

  const renderEditableList = (section, field, title) => {
    const items = data[section][field];

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2">
            <span className="text-slate-400 text-xs sm:text-sm">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateArrayItem(section, field, index, e.target.value)}
              className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
              placeholder={`Enter ${title.toLowerCase()}...`}
            />
            <button
              onClick={() => deleteArrayItem(section, field, index)}
              className="text-red-400 hover:text-red-600 transition-colors px-1 sm:px-2 text-sm"
              title="Delete item"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem(section, field)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2 transition-colors"
        >
          + Add {title}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">
      {/* Blueprint Section (formerly Daily Intentions) */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
        <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>🎯</span>
          Blueprint
        </h3>
        <textarea
          value={data.dailyIntentions || ''}
          onChange={(e) => updateField('dailyIntentions', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all resize-none"
          placeholder="What do you want to accomplish today?"
          rows="4"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        />
      </div>

      {/* Todo List Section */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-100">
        <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
          <span>📝</span>
          Todo List
        </h3>
        <textarea
          value={data.todoContent || ''}
          onChange={(e) => updateField('todoContent', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:border-amber-300 transition-all resize-none leading-relaxed"
          placeholder="Your continuous note sheet..."
          rows="20"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        />
      </div>
    </div>
  );
};

export default Blueprint;
