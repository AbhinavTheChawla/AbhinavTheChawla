import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, ShoppingCart, ExternalLink, Heart, Sparkles, Settings, Keyboard } from 'lucide-react';
import GroomingJournal from './GroomingJournal';
import Todo from './Todo';
import AgentOrchestrator from '../agents/AgentOrchestrator';
import SyncSettings from './SyncSettings';
import Food from './Food';
import Media from './Media';
import TypingTest from './TypingTest';
import useStore from '../store';
import { initializeSupabase } from '../services/supabaseClient';
import { syncService } from '../services/syncService';

const PersonalOrganizer = () => {
  // Get state and actions from Zustand store
  const categories = useStore((state) => state.categories);
  const wardrobeData = useStore((state) => state.wardrobeData);
  const wishlist = useStore((state) => state.wishlist);
  const brandUrls = useStore((state) => state.brandUrls);
  const wishlistUrls = useStore((state) => state.wishlistUrls);
  const foodData = useStore((state) => state.foodData);
  const mediaData = useStore((state) => state.mediaData);
  const groomingData = useStore((state) => state.groomingData);
  const dailyReflection = useStore((state) => state.dailyReflection);
  const weeklyTracker = useStore((state) => state.weeklyTracker);
  const weightData = useStore((state) => state.weightData);

  const updateCategories = useStore((state) => state.updateCategories);
  const updateWardrobe = useStore((state) => state.updateWardrobe);
  const updateWishlist = useStore((state) => state.updateWishlist);
  const updateBrandUrls = useStore((state) => state.updateBrandUrls);
  const updateWishlistUrls = useStore((state) => state.updateWishlistUrls);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  const supabaseUrl = useStore((state) => state.supabaseUrl);
  const supabaseAnonKey = useStore((state) => state.supabaseAnonKey);
  const userId = useStore((state) => state.userId);

  // Initialize active tab from localStorage or default to 'media'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'media';
  });
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBrandUrl, setEditingBrandUrl] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Column resize state
  const [columnWidths, setColumnWidths] = useState({
    category: 150,
    over: 150,
    tops: 150,
    bottoms: 150,
    shoes: 150,
    accessories: 150
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const resizeStartX = useRef(null);
  const resizeStartWidth = useRef(null);

  // Track if component has mounted to prevent auto-upload on initial load
  const isInitialMount = useRef(true);
  const syncTimeoutRef = useRef(null);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Initialize Supabase on mount if credentials exist
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      initializeSupabase(supabaseUrl, supabaseAnonKey);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  // Auto-download on mount
  useEffect(() => {
    const autoDownload = async () => {
      try {
        if (supabaseUrl && supabaseAnonKey && userId) {
          setSyncStatus('⬇️ Syncing...');
          const result = await syncService.downloadData(userId);

          // Mark initial mount as complete BEFORE reloading state
          // This ensures future auto-uploads will work
          isInitialMount.current = false;

          if (result.success && !result.firstSync && result.hasChanges) {
            // Reload state from localStorage instead of refreshing the page
            reloadFromStorage();

            // Dispatch event to notify other components to reload
            window.dispatchEvent(new CustomEvent('supabase-sync-complete'));

            setSyncStatus('✅ Synced');
            setTimeout(() => setSyncStatus(''), 3000);
          } else if (result.success) {
            setSyncStatus('✅ Up to date');
            setTimeout(() => setSyncStatus(''), 3000);
          }
        } else {
          // No Supabase configured, still mark as complete so local changes can be made
          isInitialMount.current = false;
        }
      } catch (error) {
        console.error('Auto-download failed:', error);
        setSyncStatus('');
        // Mark as complete even on error to allow local edits
        isInitialMount.current = false;
      }
    };

    autoDownload();
  }, []); // Only run once on mount

  // Auto-upload when data changes (debounced)
  useEffect(() => {
    // Skip auto-upload on initial mount to prevent race condition with auto-download
    if (isInitialMount.current) {
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey || !userId) return;

    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Show brief upload indicator
    setSyncStatus('💾 Saving...');

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await syncService.uploadData(userId);
        setSyncStatus('✅ Saved');
        setTimeout(() => setSyncStatus(''), 2000);
      } catch (error) {
        console.error('Auto-upload failed:', error);
        setSyncStatus('❌ Save failed');
        setTimeout(() => setSyncStatus(''), 3000);
      }
    }, 2000); // Debounce for 2 seconds

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [categories, wardrobeData, wishlist, brandUrls, wishlistUrls, foodData, mediaData, groomingData, dailyReflection, weeklyTracker, weightData, supabaseUrl, supabaseAnonKey, userId]);

  // Real-time polling for cross-device sync (check every 10 seconds)
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey || !userId) return;

    const pollInterval = setInterval(async () => {
      // Don't poll if currently syncing or if there are pending uploads
      if (syncService.isSyncing() || syncTimeoutRef.current) {
        return;
      }

      try {
        const result = await syncService.downloadData(userId);

        if (result.success && result.hasChanges) {
          console.log('🔄 Detected remote changes, syncing...');

          // Reload state from localStorage
          reloadFromStorage();

          // Dispatch event to notify other components to reload
          window.dispatchEvent(new CustomEvent('supabase-sync-complete'));

          // Show brief notification
          setSyncStatus('🔄 Synced from other device');
          setTimeout(() => setSyncStatus(''), 3000);
        }
      } catch (error) {
        console.error('Polling sync failed:', error);
        // Don't show error to user for background polls
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [supabaseUrl, supabaseAnonKey, userId, reloadFromStorage]);

  const columns = ['over', 'tops', 'bottoms', 'shoes', 'accessories'];
  const columnNames = {
    over: 'Over',
    tops: 'Tops',
    bottoms: 'Bottoms',
    shoes: 'Shoes',
    accessories: 'Accessories'
  };

  const toggleWishlist = (categoryId, column, itemIndex) => {
    const key = `${categoryId}-${column}-${itemIndex}`;
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(key)) {
      newWishlist.delete(key);
    } else {
      newWishlist.add(key);
    }
    updateWishlist(newWishlist);
  };

  const updateItem = (categoryId, column, itemIndex, value) => {
    const newData = {
      ...wardrobeData,
      [categoryId]: {
        ...wardrobeData[categoryId],
        [column]: wardrobeData[categoryId][column].map((item, idx) =>
          idx === itemIndex ? value : item
        )
      }
    };
    updateWardrobe(newData);
  };

  const addItem = (categoryId, column) => {
    const newData = {
      ...wardrobeData,
      [categoryId]: {
        ...wardrobeData[categoryId],
        [column]: [...(wardrobeData[categoryId][column] || []), '']
      }
    };
    updateWardrobe(newData);
    setEditingItem(`${categoryId}-${column}-${(wardrobeData[categoryId][column] || []).length}`);
  };

  const deleteItem = (categoryId, column, itemIndex) => {
    const newData = {
      ...wardrobeData,
      [categoryId]: {
        ...wardrobeData[categoryId],
        [column]: wardrobeData[categoryId][column].filter((_, idx) => idx !== itemIndex)
      }
    };
    updateWardrobe(newData);

    // Remove from wishlist if it was in wishlist
    const key = `${categoryId}-${column}-${itemIndex}`;
    const newWishlist = new Set(wishlist);
    newWishlist.delete(key);
    updateWishlist(newWishlist);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newId = Math.max(...categories.map(c => c.id)) + 1;

      updateCategories([...categories, {
        id: newId,
        name: newCategoryName
      }]);

      updateWardrobe({
        ...wardrobeData,
        [newId]: { over: [], tops: [], bottoms: [], shoes: [], accessories: [] }
      });

      setNewCategoryName('');
    }
  };

  const deleteCategory = (categoryId) => {
    updateCategories(categories.filter(c => c.id !== categoryId));
    const newData = { ...wardrobeData };
    delete newData[categoryId];
    updateWardrobe(newData);
  };

  const updateCategoryName = (categoryId, name) => {
    updateCategories(categories.map(c =>
      c.id === categoryId ? { ...c, name } : c
    ));
    setEditingCategory(null);
  };

  // Column resize handlers
  const handleResizeStart = (e, columnName) => {
    e.preventDefault();
    setResizingColumn(columnName);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[columnName];
  };

  const handleResizeMove = (e) => {
    if (!resizingColumn) return;

    const diff = e.clientX - resizeStartX.current;
    const newWidth = Math.max(80, resizeStartWidth.current + diff);

    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  };

  const handleResizeEnd = () => {
    setResizingColumn(null);
  };

  // Add global mouse move and up listeners for resize
  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, columnWidths]);

  const updateBrandUrl = (categoryId, column, itemIndex, url) => {
    const key = `${categoryId}-${column}-${itemIndex}`;
    let finalUrl = url.trim();

    // Add https:// if no protocol specified
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    updateBrandUrls({
      ...brandUrls,
      [key]: finalUrl
    });
    setEditingBrandUrl(null);
  };

  const updateWishlistUrl = (key, url) => {
    let finalUrl = url.trim();

    // Add https:// if no protocol specified
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    updateWishlistUrls({
      ...wishlistUrls,
      [key]: finalUrl
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex flex-row gap-2 items-center">
            {/* Sync Status Indicator */}
            {syncStatus ? (
              <div className="px-3 py-2 bg-slate-100 text-slate-700 text-xs rounded-xl flex items-center justify-center whitespace-nowrap shadow-sm">
                {syncStatus}
              </div>
            ) : (
              supabaseUrl && supabaseAnonKey && userId && (
                <div className="px-3 py-2 bg-green-50 text-green-700 text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Auto-sync enabled
                </div>
              )
            )}

            {/* Settings Button */}
            <button
              onClick={() => setShowSyncSettings(true)}
              className="px-3 py-2 bg-slate-500/90 text-white text-xs rounded-xl hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center gap-1.5 whitespace-nowrap"
              title="Sync Settings"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Sync Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>
        </div>

        {/* Sync Settings Modal */}
        <SyncSettings isOpen={showSyncSettings} onClose={() => setShowSyncSettings(false)} />

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'wardrobe'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('grooming')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'grooming'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Grooming
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === 'food'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'ai' ? 'fill-violet-600' : ''} />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </button>
          <button
            onClick={() => setActiveTab('typing')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === 'typing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Keyboard size={14} />
            <span className="hidden sm:inline">Typing Test</span>
            <span className="sm:hidden">Typing</span>
          </button>
        </div>

        {/* Media Tab Content */}
        {activeTab === 'media' && (
          <Media />
        )}

        {/* Wardrobe Tab Content */}
        {activeTab === 'wardrobe' && (
          <>
            {/* Add Category Section */}
            <div className="mb-3 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                placeholder="New category name..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
              <button
                onClick={addCategory}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md font-medium whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Add Category</span>
              </button>
            </div>

        {/* Main Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <th
                    className="p-1 sm:p-2 md:p-3 text-left font-semibold text-xs sm:text-sm relative"
                    style={{ width: `${columnWidths.category}px` }}
                  >
                    Category
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-400 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, 'category')}
                    />
                  </th>
                  {columns.map(col => (
                    <th
                      key={col}
                      className="p-1 sm:p-2 md:p-3 text-left font-semibold text-xs sm:text-sm relative"
                      style={{ width: `${columnWidths[col]}px` }}
                    >
                      {columnNames[col]}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-400 transition-colors"
                        onMouseDown={(e) => handleResizeStart(e, col)}
                      />
                    </th>
                  ))}
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
                    <td className="p-1 sm:p-2 md:p-3">
                      <div className="flex items-center gap-2">
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategories(categories.map(c =>
                              c.id === category.id ? { ...c, name: e.target.value } : c
                            ))}
                            onBlur={() => setEditingCategory(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(null)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-full"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="font-semibold cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors duration-150 text-xs sm:text-sm break-words"
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
                        <td key={col} className="p-1 sm:p-2 md:p-3">
                          <div className="space-y-1 sm:space-y-1.5">
                            {items.map((item, itemIndex) => {
                              const itemKey = `${category.id}-${col}-${itemIndex}`;
                              const isWishlist = wishlist.has(itemKey);
                              const isEditing = editingItem === itemKey;

                              // For brands column, handle URL linking
                              const isBrandsColumn = col === 'brands';
                              const brandUrl = brandUrls[itemKey] || '';

                              return (
                                <div key={itemIndex} className="flex items-center gap-1 sm:gap-2 group">
                                  {!isBrandsColumn && (
                                    <>
                                      <button
                                        onClick={() => toggleWishlist(category.id, col, itemIndex)}
                                        className="flex-shrink-0 transition-all duration-150"
                                        title="Add to wishlist"
                                      >
                                        <ShoppingCart
                                          size={14}
                                          className={`sm:w-4 sm:h-4 ${isWishlist
                                            ? 'fill-emerald-500 text-emerald-500'
                                            : 'text-slate-300 group-hover:text-slate-400 hover:scale-110'
                                          }`}
                                        />
                                      </button>
                                    </>
                                  )}
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => updateItem(category.id, col, itemIndex, e.target.value)}
                                      onBlur={() => setEditingItem(null)}
                                      onKeyPress={(e) => e.key === 'Enter' && setEditingItem(null)}
                                      className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex-1 flex items-center gap-1 sm:gap-2">
                                      {isBrandsColumn && brandUrl ? (
                                        <a
                                          href={brandUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors duration-150 font-medium"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {item || <span className="text-slate-400">Click to edit...</span>}
                                          <ExternalLink size={10} className="sm:w-3 sm:h-3" />
                                        </a>
                                      ) : (
                                        <span
                                          onClick={() => setEditingItem(itemKey)}
                                          className="flex-1 text-xs sm:text-sm cursor-pointer hover:bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors duration-150 text-slate-700 break-words"
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
                                          <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <button
                                    onClick={() => deleteItem(category.id, col, itemIndex)}
                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-150 hover:scale-110"
                                  >
                                    <X size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => addItem(category.id, col)}
                              className="text-indigo-600 hover:text-indigo-700 flex items-center font-medium transition-colors duration-150"
                              title="Add item"
                            >
                              <Plus size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Grooming Journal Tab Content */}
        {activeTab === 'grooming' && (
          <GroomingJournal />
        )}

        {/* Food Tab Content */}
        {activeTab === 'food' && (
          <Food />
        )}

        {/* AI Assistant Tab Content */}
        {activeTab === 'ai' && (
          <AgentOrchestrator />
        )}

        {/* Typing Test Tab Content */}
        {activeTab === 'typing' && (
          <TypingTest />
        )}
      </div>
    </div>
  );
};

export default PersonalOrganizer;
