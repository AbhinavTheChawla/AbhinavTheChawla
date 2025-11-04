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
    <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-full mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              My Wardrobe
            </h1>
            <span className="text-white/80 text-lg">✨</span>
          </div>
          <button
            onClick={clearAllData}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Clear All Data
          </button>
        </div>

        <div className="mb-6 flex gap-3 animate-slide-up">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            placeholder="New category name..."
            className="flex-1 px-6 py-4 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 text-gray-800 placeholder-gray-400 font-medium transition-all duration-300"
          />
          <button
            onClick={addCategory}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <th className="p-5 text-left font-bold text-lg tracking-wide">Category</th>
                {columns.map(col => (
                  <th key={col} className="p-5 text-left font-bold text-lg tracking-wide">{columnNames[col]}</th>
                ))}
                <th className="p-5 text-center font-bold text-lg tracking-wide w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, idx) => (
                <tr key={category.id} className="border-b-2 border-purple-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
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
                          className="px-4 py-2 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-gray-800"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="font-bold text-lg cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
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
                      <td key={col} className="p-5 align-top">
                        <div className="space-y-2">
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
                              <div key={itemIndex} className="flex items-center gap-2 group bg-white/50 hover:bg-white/80 rounded-lg p-2 transition-all duration-200">
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => moveItemUp(category.id, col, itemIndex)}
                                    disabled={isFirst}
                                    className={`${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-all duration-200'}`}
                                    title="Move up"
                                  >
                                    <ChevronUp size={16} />
                                  </button>
                                  <button
                                    onClick={() => moveItemDown(category.id, col, itemIndex)}
                                    disabled={isLast}
                                    className={`${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-all duration-200'}`}
                                    title="Move down"
                                  >
                                    <ChevronDown size={16} />
                                  </button>
                                </div>
                                {!isBrandsColumn && (
                                  <button
                                    onClick={() => toggleWishlist(category.id, col, itemIndex)}
                                    className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                                    title="Add to wishlist"
                                  >
                                    <ShoppingCart
                                      size={18}
                                      className={isWishlist ? 'fill-emerald-500 text-emerald-500 drop-shadow-md' : 'text-gray-400 group-hover:text-purple-400'}
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
                                    className="flex-1 px-3 py-2 text-sm border-2 border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium bg-white shadow-md"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex-1 flex items-center gap-2">
                                    {isBrandsColumn && brandUrl ? (
                                      <a
                                        href={brandUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline decoration-2 underline-offset-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {item || <span className="text-gray-400">Click to edit...</span>}
                                        <ExternalLink size={14} className="text-blue-500" />
                                      </a>
                                    ) : (
                                      <span
                                        onClick={() => setEditingItem(itemKey)}
                                        className="flex-1 text-sm font-medium cursor-pointer hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-700"
                                      >
                                        {item || <span className="text-gray-400 italic">Click to edit...</span>}
                                      </span>
                                    )}
                                    {isBrandsColumn && (
                                      <button
                                        onClick={() => setEditingBrandUrl(itemKey)}
                                        className="opacity-0 group-hover:opacity-100 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded p-1 transition-all duration-200"
                                        title={brandUrl ? "Edit URL" : "Add URL"}
                                      >
                                        <ExternalLink size={16} />
                                      </button>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={() => deleteItem(category.id, col, itemIndex)}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 rounded-full p-1 transition-all duration-200 transform hover:scale-110"
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
                                className="flex-1 px-3 py-2 text-sm border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium bg-white shadow-md"
                                autoFocus
                              />
                            </div>
                          )}
                          <button
                            onClick={() => addItem(category.id, col)}
                            className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-100 px-3 py-2 rounded-lg flex items-center gap-1 transition-all duration-200 transform hover:scale-105"
                          >
                            <Plus size={16} />
                            Add item
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-5 text-center">
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-white hover:bg-red-500 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-md hover:shadow-lg"
                      title="Delete category"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg animate-fade-in">
          <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">💡 Pro Tips</p>
          <ul className="list-none space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span className="font-medium">Click any item to edit it individually</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span className="font-medium">Use the up/down arrows to reorder items within each cell</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">🛒</span>
              <span className="font-medium">Click the shopping cart icon to mark items you want to buy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">🔗</span>
              <span className="font-medium">In the Brands column, click the link icon to add website URLs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span className="font-medium">Brand names with URLs become clickable links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">×</span>
              <span className="font-medium">Hover over items and click the X to delete them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">+</span>
              <span className="font-medium">Use "Add item" to add new clothing items to each category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span className="font-medium">Click category names to rename them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">💾</span>
              <span className="font-medium">All changes are automatically saved to your browser</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WardrobeOrganizer;
