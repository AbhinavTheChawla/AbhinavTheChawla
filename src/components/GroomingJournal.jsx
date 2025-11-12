import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const GroomingJournal = () => {
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

  const [data, setData] = useState(() => loadFromStorage('groomingData', {
    am: [
      ['Gentle Cleanser', 'CeraVe Hydrating Cleanser'],
      ['Toner', 'Thayers Witch Hazel'],
      ['Vitamin C Serum', 'The Ordinary Vitamin C 23%'],
      ['Moisturizer', 'Cetaphil Daily Hydrating Lotion'],
      ['Sunscreen SPF 50', 'La Roche-Posay Anthelios']
    ],
    pm: [
      ['Oil Cleanser', 'DHC Deep Cleansing Oil'],
      ['Foaming Cleanser', 'CeraVe Foaming Facial Cleanser'],
      ['Exfoliant', 'Paula\'s Choice 2% BHA - 2-3x/week'],
      ['Retinol Serum', 'The Ordinary Retinol 0.5%'],
      ['Night Cream', 'Neutrogena Hydro Boost Night']
    ],
    supplementary: [],
    perfumes: [
      ['Daily: Bleu de Chanel', 'Woody aromatic'],
      ['Evening: Dior Sauvage', 'Fresh spicy'],
      ['Summer: Acqua di Gio', 'Aquatic citrus']
    ],
    supplements: [
      ['Morning: Multivitamin', 'Garden of Life Men\'s Multi'],
      ['Morning: Vitamin D3', '5000 IU'],
      ['Morning: Omega-3', 'Nordic Naturals - 2 caps'],
      ['Evening: Magnesium', '400mg before bed']
    ],
    shaving: [
      ['Face: Wet Shave', 'Every other day - Safety razor'],
      ['Body: Trimmer', 'Weekly - Guard #2'],
      ['Laser: Back & Shoulders', 'Session 4/8 - Next: Nov 15']
    ],
    hair: [
      ['Shampoo', 'Olaplex No. 4 - 2-3x/week'],
      ['Conditioner', 'Olaplex No. 5'],
      ['Hair Oil', 'Moroccanoil - 1-2 pumps'],
      ['Styling', 'Baxter Clay Pomade']
    ],
    wishlist: [
      ['Drunk Elephant C-Firma', '$80', 'High'],
      ['Le Labo Santal 33', '$285', 'High'],
      ['Dyson Supersonic', '$430', 'Medium']
    ]
  }));

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('groomingData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving grooming data:', error);
    }
  }, [data]);

  const updateCell = (category, rowIndex, colIndex, value) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row
      )
    }));
  };

  const addRow = (category) => {
    const isWishlist = category === 'wishlist';
    setData(prev => ({
      ...prev,
      [category]: [...prev[category], isWishlist ? ['', '', 'Medium'] : ['', '']]
    }));
  };

  const deleteRow = (category, index) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const renderTable = (category, title, emoji, hasNumbers = false, isWishlist = false) => {
    const rows = data[category] || [];

    return (
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="text-xs sm:text-sm font-semibold uppercase text-slate-600 mb-2 sm:mb-3 tracking-wide flex items-center gap-2">
          <span>{emoji}</span>
          <span>{title}</span>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {hasNumbers && <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 w-8 sm:w-12">#</th>}
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500">Product</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500">Details</th>
                {isWishlist && <th className="p-2 sm:p-3 text-left text-xs font-semibold text-slate-500 w-24 sm:w-32">Priority</th>}
                <th className="p-2 sm:p-3 text-center text-xs font-semibold text-slate-500 w-12 sm:w-16"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  {hasNumbers && (
                    <td className="p-2 sm:p-3 text-center text-slate-400 font-medium text-xs sm:text-sm">{i + 1}</td>
                  )}
                  <td className="p-2 sm:p-3">
                    <input
                      type="text"
                      value={row[0]}
                      onChange={(e) => updateCell(category, i, 0, e.target.value)}
                      className="w-full border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 sm:py-1.5 text-xs sm:text-sm transition-all"
                      placeholder="Enter product name..."
                    />
                  </td>
                  <td className="p-2 sm:p-3">
                    <input
                      type="text"
                      value={row[1]}
                      onChange={(e) => updateCell(category, i, 1, e.target.value)}
                      className="w-full border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 sm:py-1.5 text-xs sm:text-sm transition-all"
                      placeholder="Enter details..."
                    />
                  </td>
                  {isWishlist && (
                    <td className="p-2 sm:p-3">
                      <input
                        type="text"
                        value={row[2]}
                        onChange={(e) => updateCell(category, i, 2, e.target.value)}
                        className="w-full border border-transparent hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-amber-50 rounded px-2 py-1 sm:py-1.5 text-xs sm:text-sm transition-all"
                        placeholder="Priority..."
                      />
                    </td>
                  )}
                  <td className="p-2 sm:p-3 text-center">
                    <button
                      onClick={() => deleteRow(category, i)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Delete row"
                    >
                      <X size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => addRow(category)}
          className="mt-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
          Add {isWishlist ? 'Wishlist Item' : title === 'AM Routine' || title === 'PM Routine' ? 'Step' : 'Item'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Grooming Routine Tracker</h2>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">Click any cell to edit • Changes save automatically</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div>
          {renderTable('am', 'AM Routine', '🌅', true)}
        </div>
        <div>
          {renderTable('pm', 'PM Routine', '🌙', true)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
        {renderTable('supplementary', 'Supplementary Skincare', '🧴')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div>
          {renderTable('perfumes', 'Perfumes', '🌸')}
        </div>
        <div>
          {renderTable('supplements', 'Supplements', '💊')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div>
          {renderTable('shaving', 'Shaving/Laser Hair Plan', '✂️')}
        </div>
        <div>
          {renderTable('hair', 'Hair', '💇')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
        {renderTable('wishlist', 'Wishlist', '⭐', false, true)}
      </div>
    </div>
  );
};

export default GroomingJournal;
