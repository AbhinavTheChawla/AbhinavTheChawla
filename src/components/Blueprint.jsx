import React, { useState, useEffect } from 'react';

const Blueprint = () => {
  // Load initial data from storage or use defaults
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return defaultValue;
    }
  };

  const [data, setData] = useState(() => loadFromStorage('blueprintData', {
    lifeNow: {
      training: 'gym + cardio + diet',
      reading: 'sidequests',
      sports: 'tennis, golf',
      practices: [
        'Morning frame check and intention setting',
        'Awareness throughout the day',
        'Evening reflection'
      ],
      dailyGoals: [
        '20min meditation/discomfort sit',
        'approval seeking detection log',
        'one hard thing over optimal by by by'
      ]
    },
    lifeNextYear: {
      career: 'UBS + marketwatch/writeups',
      reading: 'fintwit, substack, books, news',
      training: 'Training',
      activities: 'Poker/Tennis/Golf',
      travel: 'skiing/surfing'
    },
    sideHustles: [
      'early career coaching',
      'search fund'
    ],
    socialMedia: {
      x: 'FinTwit',
      tiktok: 'inspo',
      reddit: 'community forums',
      ig: 'stories/reels',
      whatsapp: 'millenial texting',
      messenger: 'gen Z texting',
      linkedin: 'engaging with network'
    },
    substances: {
      psychedelics: 'festivals/adventures',
      caffeine: 'Sustained 4hr energy',
      pouches: 'Quick 2hr energy',
      ketamine: 'kill head noise'
    }
  }));

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('blueprintData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving blueprint data:', error);
    }
  }, [data]);

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section, field, index, value) => {
    if (field) {
      // For nested arrays like lifeNow.practices
      setData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: prev[section][field].map((item, i) => i === index ? value : item)
        }
      }));
    } else {
      // For top-level arrays like sideHustles
      setData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => i === index ? value : item)
      }));
    }
  };

  const addArrayItem = (section, field) => {
    if (field) {
      // For nested arrays
      setData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], '']
        }
      }));
    } else {
      // For top-level arrays
      setData(prev => ({
        ...prev,
        [section]: [...prev[section], '']
      }));
    }
  };

  const deleteArrayItem = (section, field, index) => {
    if (field) {
      // For nested arrays
      setData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: prev[section][field].filter((_, i) => i !== index)
        }
      }));
    } else {
      // For top-level arrays
      setData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  const renderEditableField = (section, field, placeholder = '') => {
    return (
      <input
        type="text"
        value={data[section][field]}
        onChange={(e) => updateField(section, field, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
        placeholder={placeholder}
      />
    );
  };

  const renderEditableList = (section, field, title) => {
    const items = field ? data[section][field] : data[section];

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateArrayItem(section, field, index, e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
              placeholder={`Enter ${title.toLowerCase()}...`}
            />
            <button
              onClick={() => deleteArrayItem(section, field, index)}
              className="text-red-400 hover:text-red-600 transition-colors px-2"
              title="Delete item"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem(section, field)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2 transition-colors"
        >
          + Add {title}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Life Blueprint</h2>
        <p className="text-slate-500 mt-1 text-sm">Click any field to edit • Changes save automatically</p>
      </div>

      {/* Life RN Section */}
      <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span>🎯</span>
          Life RN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Training</label>
            {renderEditableField('lifeNow', 'training', 'Enter training routine...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reading</label>
            {renderEditableField('lifeNow', 'reading', 'Enter reading list...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Sports</label>
            {renderEditableField('lifeNow', 'sports', 'Enter sports...')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 rounded-lg p-4">
            <label className="block text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Daily Practices</label>
            {renderEditableList('lifeNow', 'practices', 'Practice')}
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <label className="block text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Daily Goals</label>
            {renderEditableList('lifeNow', 'dailyGoals', 'Goal')}
          </div>
        </div>
      </div>

      {/* Life Next Year Section */}
      <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <span>🚀</span>
          Life Next Year
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Career</label>
            {renderEditableField('lifeNextYear', 'career', 'Enter career goals...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reading</label>
            {renderEditableField('lifeNextYear', 'reading', 'Enter reading plans...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Training</label>
            {renderEditableField('lifeNextYear', 'training', 'Enter training goals...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Activities</label>
            {renderEditableField('lifeNextYear', 'activities', 'Enter activities...')}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Travel</label>
            {renderEditableField('lifeNextYear', 'travel', 'Enter travel plans...')}
          </div>
        </div>
      </div>

      {/* Side Hustles Section */}
      <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span>💼</span>
          Side Hustles
        </h3>
        {renderEditableList('sideHustles', null, 'Side Hustle')}
      </div>

      {/* Social Media Section */}
      <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
          <span>📱</span>
          Social Media Strategy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">X (Twitter)</label>
            {renderEditableField('socialMedia', 'x', 'Enter X strategy...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">TikTok</label>
            {renderEditableField('socialMedia', 'tiktok', 'Enter TikTok strategy...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Reddit</label>
            {renderEditableField('socialMedia', 'reddit', 'Enter Reddit strategy...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Instagram</label>
            {renderEditableField('socialMedia', 'ig', 'Enter Instagram strategy...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">WhatsApp</label>
            {renderEditableField('socialMedia', 'whatsapp', 'Enter WhatsApp usage...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Messenger</label>
            {renderEditableField('socialMedia', 'messenger', 'Enter Messenger usage...')}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">LinkedIn</label>
            {renderEditableField('socialMedia', 'linkedin', 'Enter LinkedIn strategy...')}
          </div>
        </div>
      </div>

      {/* Substances Section */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>⚗️</span>
          Substances
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Psychedelics</label>
            {renderEditableField('substances', 'psychedelics', 'Enter psychedelics usage...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Caffeine</label>
            {renderEditableField('substances', 'caffeine', 'Enter caffeine usage...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Pouches</label>
            {renderEditableField('substances', 'pouches', 'Enter pouches usage...')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Ketamine</label>
            {renderEditableField('substances', 'ketamine', 'Enter ketamine usage...')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blueprint;
