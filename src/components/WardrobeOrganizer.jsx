import React, { useState } from 'react';
import { Plus, Trash2, X, ShoppingCart, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

const WardrobeOrganizer = () => {
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

  const [categories, setCategories] = useState(() => loadFromStorage('wardrobe_categories', [
    { id: 1, name: 'Workwear' },
    { id: 2, name: 'Smartwear' },
    { id: 3, name: 'Streetwear' },
    { id: 4, name: 'Casual Clothes' },
    { id: 5, name: 'Active Clothes' },
    { id: 6, name: 'Other' }
  ]));

  const [wardrobeData, setWardrobeData] = useState(() => loadFromStorage('wardrobe_data', {
    1: {
      over: ['Suit: Navy + Charcoal'],
      tops: ['10x Uniqlo Shirts'],
      bottoms: ['Pants: Navy + Charcoal'],
      shoes: ['Oxfords', 'Tassel Loafers'],
      accessories: [],
      brands: []
    },
    2: {
      over: ['Half Zips: RM + SS', 'Full Zips: SS'],
      tops: ['Polos: SS', 'Casual Shirt'],
      bottoms: ['Pants: Navy + Sand + Linen', 'Shorts: Sand Linen shorts'],
      shoes: ['White Sneakers', 'Casual Loafers', 'Birk Sandals'],
      accessories: [],
      brands: []
    },
    3: {
      over: ['Hoodies: Black + ILU', 'Jacket: Grey zip'],
      tops: ['2x White Shirts', '3x Oversized shirts'],
      bottoms: ['Jeans: brown carpenter, black, light navy', 'Jean shorts: light navy, black'],
      shoes: ['Brown dunk lows', 'CDG Converses', 'Birk Clogs'],
      accessories: [],
      brands: []
    },
    4: {
      over: ['Sweater: Grey'],
      tops: ['2x navy shirts'],
      bottoms: ['straight leg trackpant: black + grey', 'ribbed cuff trackpant: black + blue', 'trackshorts: black + grey'],
      shoes: ['Home Slippers/uggs'],
      accessories: [],
      brands: []
    },
    5: {
      over: ['2xu spacer hoodie'],
      tops: ['black/navy t-shirt', 'black + white singlet', 'compression + half-zip'],
      bottoms: ['Shorts: 3x gymshark/asic'],
      shoes: ['Reeboks (Lifting)', 'Nike V5 RNR (Cardio)', 'Shower Slides (Adidas)'],
      accessories: [],
      brands: []
    },
    6: {
      over: [],
      tops: [],
      bottoms: ['Hiking/Fleece pants', 'Boardshorts'],
      shoes: [],
      accessories: [],
      brands: []
    }
  }));

  const [wishlist, setWishlist] = useState(() => {
    const saved = loadFromStorage('wardrobe_wishlist', []);
    return new Set(saved);
  });

  const [brandUrls, setBrandUrls] = useState(() => loadFromStorage('wardrobe_brand_urls', {}));

  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBrandUrl, setEditingBrandUrl] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const columns = ['over', 'tops', 'bottoms', 'shoes', 'accessories', 'brands'];
  const columnNames = {
    over: 'Over',
    tops: 'Tops',
    bottoms: 'Bottoms',
    shoes: 'Shoes',
    accessories: 'Accessories',
    brands: 'Brands'
  };

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    try {
      localStorage.setItem('wardrobe_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }, [categories]);

  React.useEffect(() => {
    try {
      localStorage.setItem('wardrobe_data', JSON.stringify(wardrobeData));
    } catch (error) {
      console.error('Error saving wardrobe data:', error);
    }
  }, [wardrobeData]);

  React.useEffect(() => {
    try {
      localStorage.setItem('wardrobe_wishlist', JSON.stringify(Array.from(wishlist)));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [wishlist]);

  React.useEffect(() => {
    try {
      localStorage.setItem('wardrobe_brand_urls', JSON.stringify(brandUrls));
    } catch (error) {
      console.error('Error saving brand URLs:', error);
    }
  }, [brandUrls]);

  const toggleWishlist = (categoryId, column, itemIndex) => {
    const key = `${categoryId}-${column}-${itemIndex}`;
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(key)) {
        newWishlist.delete(key);
      } else {
        newWishlist.add(key);
      }
      return newWishlist;
    });
  };

  const updateItem = (categoryId, column, itemIndex, value) => {
    setWardrobeData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [column]: prev[categoryId][column].map((item, idx) =>
          idx === itemIndex ? value : item
        )
      }
    }));
  };

  const addItem = (categoryId, column) => {
    setWardrobeData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [column]: [...(prev[categoryId][column] || []), '']
      }
    }));
    setEditingItem(`${categoryId}-${column}-${(wardrobeData[categoryId][column] || []).length}`);
  };

  const deleteItem = (categoryId, column, itemIndex) => {
    setWardrobeData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [column]: prev[categoryId][column].filter((_, idx) => idx !== itemIndex)
      }
    }));

    // Remove from wishlist if it was in wishlist
    const key = `${categoryId}-${column}-${itemIndex}`;
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      newWishlist.delete(key);
      return newWishlist;
    });
  };

  const moveItemUp = (categoryId, column, itemIndex) => {
    if (itemIndex === 0) return;

    setWardrobeData(prev => {
      const items = [...prev[categoryId][column]];
      [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];

      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [column]: items
        }
      };
    });

    // Swap wishlist status
    const currentKey = `${categoryId}-${column}-${itemIndex}`;
    const aboveKey = `${categoryId}-${column}-${itemIndex - 1}`;
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      const currentInWishlist = newWishlist.has(currentKey);
      const aboveInWishlist = newWishlist.has(aboveKey);

      newWishlist.delete(currentKey);
      newWishlist.delete(aboveKey);

      if (currentInWishlist) newWishlist.add(aboveKey);
      if (aboveInWishlist) newWishlist.add(currentKey);

      return newWishlist;
    });
  };

  const moveItemDown = (categoryId, column, itemIndex) => {
    const items = wardrobeData[categoryId][column];
    if (itemIndex === items.length - 1) return;

    setWardrobeData(prev => {
      const items = [...prev[categoryId][column]];
      [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];

      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [column]: items
        }
      };
    });

    // Swap wishlist status
    const currentKey = `${categoryId}-${column}-${itemIndex}`;
    const belowKey = `${categoryId}-${column}-${itemIndex + 1}`;
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      const currentInWishlist = newWishlist.has(currentKey);
      const belowInWishlist = newWishlist.has(belowKey);

      newWishlist.delete(currentKey);
      newWishlist.delete(belowKey);

      if (currentInWishlist) newWishlist.add(belowKey);
      if (belowInWishlist) newWishlist.add(currentKey);

      return newWishlist;
    });
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newId = Math.max(...categories.map(c => c.id)) + 1;

      setCategories([...categories, {
        id: newId,
        name: newCategoryName
      }]);

      setWardrobeData(prev => ({
        ...prev,
        [newId]: { over: [], tops: [], bottoms: [], shoes: [], accessories: [], brands: [] }
      }));

      setNewCategoryName('');
    }
  };

  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    setWardrobeData(prev => {
      const newData = { ...prev };
      delete newData[categoryId];
      return newData;
    });
  };

  const updateCategoryName = (categoryId, name) => {
    setCategories(categories.map(c =>
      c.id === categoryId ? { ...c, name } : c
    ));
    setEditingCategory(null);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all wardrobe data? This cannot be undone.')) {
      localStorage.removeItem('wardrobe_categories');
      localStorage.removeItem('wardrobe_data');
      localStorage.removeItem('wardrobe_wishlist');
      localStorage.removeItem('wardrobe_brand_urls');
      window.location.reload();
    }
  };

  const updateBrandUrl = (categoryId, column, itemIndex, url) => {
    const key = `${categoryId}-${column}-${itemIndex}`;
    let finalUrl = url.trim();

    // Add https:// if no protocol specified
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setBrandUrls(prev => ({
      ...prev,
      [key]: finalUrl
    }));
    setEditingBrandUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              My Wardrobe
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Organize and manage your clothing collection</p>
          </div>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500/90 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            Clear All Data
          </button>
        </div>

        {/* Add Category Section */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            placeholder="New category name..."
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm transition-all duration-200"
          />
          <button
            onClick={addCategory}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <th className="p-5 text-left font-semibold">Category</th>
                  {columns.map(col => (
                    <th key={col} className="p-5 text-left font-semibold">{columnNames[col]}</th>
                  ))}
                  <th className="p-5 text-center font-semibold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, idx) => (
                  <tr
                    key={category.id}
                    className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => setCategories(categories.map(c =>
                              c.id === category.id ? { ...c, name: e.target.value } : c
                            ))}
                            onBlur={() => setEditingCategory(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(null)}
                            className="px-3 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="font-semibold cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors duration-150"
                            onClick={() => setEditingCategory(category.id)}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                    </td>
                    {columns.map(col => {
                      const items = wardrobeData[category.id]?.[col] || [];

                      return (
                        <td key={col} className="p-5">
                          <div className="space-y-2.5">
                            {items.map((item, itemIndex) => {
                              const itemKey = `${category.id}-${col}-${itemIndex}`;
                              const isWishlist = wishlist.has(itemKey);
                              const isEditing = editingItem === itemKey;
                              const isFirst = itemIndex === 0;
                              const isLast = itemIndex === items.length - 1;

                              // For brands column, handle URL linking
                              const isBrandsColumn = col === 'brands';
                              const brandUrl = brandUrls[itemKey] || '';

                              return (
                                <div key={itemIndex} className="flex items-center gap-2 group">
                                  <div className="flex flex-col">
                                    <button
                                      onClick={() => moveItemUp(category.id, col, itemIndex)}
                                      disabled={isFirst}
                                      className={`transition-all duration-150 ${
                                        isFirst
                                          ? 'text-slate-200 cursor-not-allowed'
                                          : 'text-slate-400 hover:text-indigo-600 hover:scale-110'
                                      }`}
                                      title="Move up"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button
                                      onClick={() => moveItemDown(category.id, col, itemIndex)}
                                      disabled={isLast}
                                      className={`transition-all duration-150 ${
                                        isLast
                                          ? 'text-slate-200 cursor-not-allowed'
                                          : 'text-slate-400 hover:text-indigo-600 hover:scale-110'
                                      }`}
                                      title="Move down"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                  </div>
                                  {!isBrandsColumn && (
                                    <button
                                      onClick={() => toggleWishlist(category.id, col, itemIndex)}
                                      className="flex-shrink-0 transition-all duration-150"
                                      title="Add to wishlist"
                                    >
                                      <ShoppingCart
                                        size={16}
                                        className={isWishlist
                                          ? 'fill-emerald-500 text-emerald-500'
                                          : 'text-slate-300 group-hover:text-slate-400 hover:scale-110'
                                        }
                                      />
                                    </button>
                                  )}
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => updateItem(category.id, col, itemIndex, e.target.value)}
                                      onBlur={() => setEditingItem(null)}
                                      onKeyPress={(e) => e.key === 'Enter' && setEditingItem(null)}
                                      className="flex-1 px-3 py-1.5 text-sm border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex-1 flex items-center gap-2">
                                      {isBrandsColumn && brandUrl ? (
                                        <a
                                          href={brandUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors duration-150 font-medium"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {item || <span className="text-slate-400">Click to edit...</span>}
                                          <ExternalLink size={12} />
                                        </a>
                                      ) : (
                                        <span
                                          onClick={() => setEditingItem(itemKey)}
                                          className="flex-1 text-sm cursor-pointer hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors duration-150 text-slate-700"
                                        >
                                          {item || <span className="text-slate-400">Click to edit...</span>}
                                        </span>
                                      )}
                                      {isBrandsColumn && (
                                        <button
                                          onClick={() => setEditingBrandUrl(itemKey)}
                                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-600 transition-all duration-150"
                                          title={brandUrl ? "Edit URL" : "Add URL"}
                                        >
                                          <ExternalLink size={14} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <button
                                    onClick={() => deleteItem(category.id, col, itemIndex)}
                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-150 hover:scale-110"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              );
                            })}
                            {editingBrandUrl && wardrobeData[category.id]?.[col]?.some((_, idx) => `${category.id}-${col}-${idx}` === editingBrandUrl) && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={brandUrls[editingBrandUrl] || ''}
                                  onChange={(e) => setBrandUrls(prev => ({ ...prev, [editingBrandUrl]: e.target.value }))}
                                  onBlur={() => {
                                    const [catId, column, idx] = editingBrandUrl.split('-');
                                    updateBrandUrl(parseInt(catId), column, parseInt(idx), brandUrls[editingBrandUrl] || '');
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const [catId, column, idx] = editingBrandUrl.split('-');
                                      updateBrandUrl(parseInt(catId), column, parseInt(idx), brandUrls[editingBrandUrl] || '');
                                    }
                                  }}
                                  placeholder="Enter website URL..."
                                  className="flex-1 px-3 py-1.5 text-sm border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
                                  autoFocus
                                />
                              </div>
                            )}
                            <button
                              onClick={() => addItem(category.id, col)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium transition-colors duration-150 hover:gap-2"
                            >
                              <Plus size={14} />
                              Add item
                            </button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-5 text-center">
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-all duration-150 hover:scale-110 rounded-lg hover:bg-red-50"
                        title="Delete category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">✨</span> Quick Tips
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Click any item to edit it individually</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Use the up/down arrows to reorder items within each cell</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Click the shopping cart icon to mark items you want to buy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>In the Brands column, click the link icon to add website URLs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Brand names with URLs become clickable links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Hover over items and click the X to delete them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Use "Add item" to add new clothing items to each category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Click category names to rename them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>All changes are automatically saved to your browser</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WardrobeOrganizer;
