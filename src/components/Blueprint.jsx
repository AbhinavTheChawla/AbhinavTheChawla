import React, { useEffect } from 'react';
import useStore from '../store';

const Blueprint = () => {
  // Get state and actions from Zustand store
  const data = useStore((state) => state.blueprintData);
  const updateBlueprint = useStore((state) => state.updateBlueprint);

  // Check if daily mantra needs to be reset
  useEffect(() => {
    const checkMantraReset = () => {
      const today = new Date().toDateString();
      const lastMantraDate = data.dailyMantraDate;

      // Reset mantra if it's a new day
      if (lastMantraDate && lastMantraDate !== today && data.dailyMantra) {
        updateBlueprint({
          ...data,
          dailyMantra: '',
          dailyMantraDate: today
        });
      } else if (!lastMantraDate) {
        // Initialize the date if not set
        updateBlueprint({
          ...data,
          dailyMantraDate: today
        });
      }
    };

    checkMantraReset();
    // Check every minute if the day has changed
    const interval = setInterval(checkMantraReset, 60000);

    return () => clearInterval(interval);
  }, [data, updateBlueprint]);

  const updateField = (field, value) => {
    const today = new Date().toDateString();
    const newData = {
      ...data,
      [field]: value
    };

    // Update the date when setting the daily mantra
    if (field === 'dailyMantra') {
      newData.dailyMantraDate = today;
    }

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
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Daily Blueprint</h2>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Your daily landing page • Changes save automatically</p>
      </div>

      {/* Daily Mantra Section */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-100">
        <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
          <span>🌅</span>
          Daily Mantra
        </h3>
        <textarea
          value={data.dailyMantra || ''}
          onChange={(e) => updateField('dailyMantra', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-all resize-none"
          placeholder="Set your mantra for today... (resets daily)"
          rows="2"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        />
      </div>

      {/* Daily Intentions Section */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
        <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>🎯</span>
          Daily Intentions
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

      {/* Weekly Intentions Section */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-100">
        <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
          <span>📅</span>
          Weekly Intentions
        </h3>
        <textarea
          value={data.weeklyIntentions || ''}
          onChange={(e) => updateField('weeklyIntentions', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition-all resize-none"
          placeholder="What are your goals for this week?"
          rows="6"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        />
      </div>

      {/* Todo/Notes Section */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-100">
        <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
          <span>📝</span>
          Notes & Tasks
        </h3>
        <textarea
          value={data.todoContent || ''}
          onChange={(e) => updateField('todoContent', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:border-amber-300 transition-all resize-none leading-relaxed"
          placeholder="Your continuous note sheet..."
          rows="12"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        />
      </div>

      {/* Life RN Section - Collapsed for less prominence */}
      <details className="mb-4 sm:mb-6">
        <summary className="cursor-pointer bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition-all">
          <h3 className="text-base sm:text-lg font-bold text-slate-700 inline-flex items-center gap-2">
            <span>⚡</span>
            Life RN (Click to expand)
          </h3>
        </summary>
        <div className="mt-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Training</label>
              <input
                type="text"
                value={data.lifeNow?.training || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNow: { ...data.lifeNow, training: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter training routine..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reading</label>
              <input
                type="text"
                value={data.lifeNow?.reading || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNow: { ...data.lifeNow, reading: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter reading list..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Sports</label>
              <input
                type="text"
                value={data.lifeNow?.sports || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNow: { ...data.lifeNow, sports: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter sports..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/60 rounded-lg p-3 sm:p-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">Daily Practices</label>
              {renderEditableList('lifeNow', 'practices', 'Practice')}
            </div>
            <div className="bg-white/60 rounded-lg p-3 sm:p-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">Daily Goals</label>
              {renderEditableList('lifeNow', 'dailyGoals', 'Goal')}
            </div>
          </div>
        </div>
      </details>

      {/* Life Next Year Section - Collapsed for less prominence */}
      <details className="mb-4 sm:mb-6">
        <summary className="cursor-pointer bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition-all">
          <h3 className="text-base sm:text-lg font-bold text-slate-700 inline-flex items-center gap-2">
            <span>🚀</span>
            Life Next Year (Click to expand)
          </h3>
        </summary>
        <div className="mt-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Career</label>
              <input
                type="text"
                value={data.lifeNextYear?.career || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNextYear: { ...data.lifeNextYear, career: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter career goals..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reading</label>
              <input
                type="text"
                value={data.lifeNextYear?.reading || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNextYear: { ...data.lifeNextYear, reading: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter reading plans..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Training</label>
              <input
                type="text"
                value={data.lifeNextYear?.training || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNextYear: { ...data.lifeNextYear, training: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter training goals..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Activities</label>
              <input
                type="text"
                value={data.lifeNextYear?.activities || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNextYear: { ...data.lifeNextYear, activities: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter activities..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Travel</label>
              <input
                type="text"
                value={data.lifeNextYear?.travel || ''}
                onChange={(e) => updateBlueprint({ ...data, lifeNextYear: { ...data.lifeNextYear, travel: e.target.value }})}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-slate-300 transition-all"
                placeholder="Enter travel plans..."
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default Blueprint;
