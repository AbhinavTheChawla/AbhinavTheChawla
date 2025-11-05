import React, { useState } from 'react';
import { Plus, Trash2, X, ShoppingCart, ChevronUp, ChevronDown, ExternalLink, Heart } from 'lucide-react';

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

  const [wishlistUrls, setWishlistUrls] = useState(() => loadFromStorage('wardrobe_wishlist_urls', {}));

  const [showWishlistModal, setShowWishlistModal] = useState(false);
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

  React.useEffect(() => {
    try {
      localStorage.setItem('wardrobe_wishlist_urls', JSON.stringify(wishlistUrls));
    } catch (error) {
      console.error('Error saving wishlist URLs:', error);
    }
  }, [wishlistUrls]);

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
      localStorage.removeItem('wardrobe_wishlist_urls');
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

  const updateWishlistUrl = (key, url) => {
    let finalUrl = url.trim();

    // Add https:// if no protocol specified
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setWishlistUrls(prev => ({
      ...prev,
      [key]: finalUrl
    }));
  };

  const getWishlistItems = () => {
    const items = [];
    Array.from(wishlist).forEach(key => {
      const [categoryId, column, itemIndex] = key.split('-');
      const category = categories.find(c => c.id === parseInt(categoryId));
      if (category && wardrobeData[categoryId]?.[column]?.[itemIndex]) {
        items.push({
          key,
          categoryName: category.name,
          columnName: columnNames[column],
          itemName: wardrobeData[categoryId][column][itemIndex],
          url: wishlistUrls[key] || ''
        });
      }
    });
    return items;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Wardrobe</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWishlistModal(true)}
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Heart size={18} />
              View Wishlist ({wishlist.size})
            </button>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Clear All Data
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            placeholder="New category name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-4 text-left font-semibold">Category</th>
                {columns.map(col => (
                  <th key={col} className="p-4 text-left font-semibold">{columnNames[col]}</th>
                ))}
                <th className="p-4 text-center font-semibold w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
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
                          className="px-2 py-1 border border-gray-300 rounded"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="font-semibold cursor-pointer text-gray-700 hover:text-blue-600"
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
                      <td key={col} className="p-4">
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
                              <div key={itemIndex} className="flex items-center gap-2 group">
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => moveItemUp(category.id, col, itemIndex)}
                                    disabled={isFirst}
                                    className={`${isFirst ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Move up"
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                  <button
                                    onClick={() => moveItemDown(category.id, col, itemIndex)}
                                    disabled={isLast}
                                    className={`${isLast ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Move down"
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                </div>
                                {!isBrandsColumn && (
                                  <button
                                    onClick={() => toggleWishlist(category.id, col, itemIndex)}
                                    className="flex-shrink-0"
                                    title="Add to wishlist"
                                  >
                                    <ShoppingCart
                                      size={16}
                                      className={isWishlist ? 'fill-green-500 text-green-500' : 'text-gray-300 group-hover:text-gray-400'}
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
                                    className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex-1 flex items-center gap-2">
                                    {isBrandsColumn && brandUrl ? (
                                      <a
                                        href={brandUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {item || <span className="text-gray-400">Click to edit...</span>}
                                        <ExternalLink size={12} />
                                      </a>
                                    ) : (
                                      <span
                                        onClick={() => setEditingItem(itemKey)}
                                        className="flex-1 text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                      >
                                        {item || <span className="text-gray-400">Click to edit...</span>}
                                      </span>
                                    )}
                                    {isBrandsColumn && (
                                      <button
                                        onClick={() => setEditingBrandUrl(itemKey)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600"
                                        title={brandUrl ? "Edit URL" : "Add URL"}
                                      >
                                        <ExternalLink size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={() => deleteItem(category.id, col, itemIndex)}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
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
                                className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            </div>
                          )}
                          <button
                            onClick={() => addItem(category.id, col)}
                            className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add item
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 p-2"
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

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Click any item to edit it individually</li>
            <li>Use the up/down arrows to reorder items within each cell</li>
            <li>Click the shopping cart icon to mark items you want to buy</li>
            <li>Click "View Wishlist" to see all wishlist items and add purchase links</li>
            <li>In the Brands column, click the link icon to add website URLs</li>
            <li>Brand names with URLs become clickable links</li>
            <li>Hover over items and click the X to delete them</li>
            <li>Use "Add item" to add new clothing items to each category</li>
            <li>Click category names to rename them</li>
            <li>All changes are automatically saved to your browser</li>
          </ul>
        </div>

        {/* Wishlist Modal */}
        {showWishlistModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="fill-green-500 text-green-500" size={24} />
                  My Wishlist
                </h2>
                <button
                  onClick={() => setShowWishlistModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {getWishlistItems().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Your wishlist is empty</p>
                    <p className="text-sm mt-2">Click the shopping cart icon on items to add them to your wishlist</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getWishlistItems().map((item) => (
                      <div key={item.key} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-800">{item.itemName}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{item.categoryName}</span>
                              <span className="mx-2">•</span>
                              <span>{item.columnName}</span>
                            </div>
                            <div className="mt-3">
                              <input
                                type="text"
                                value={item.url}
                                onChange={(e) => updateWishlistUrl(item.key, e.target.value)}
                                placeholder="Add purchase link (e.g., https://store.com/product)..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 items-start">
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center gap-1"
                              >
                                <ExternalLink size={14} />
                                Visit
                              </a>
                            )}
                            <button
                              onClick={() => {
                                const [categoryId, column, itemIndex] = item.key.split('-');
                                toggleWishlist(parseInt(categoryId), column, parseInt(itemIndex));
                              }}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 flex items-center gap-1"
                              title="Remove from wishlist"
                            >
                              <X size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  <strong>Total items:</strong> {getWishlistItems().length}
                  {getWishlistItems().filter(i => i.url).length > 0 && (
                    <span className="ml-4">
                      <strong>With links:</strong> {getWishlistItems().filter(i => i.url).length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeOrganizer;
