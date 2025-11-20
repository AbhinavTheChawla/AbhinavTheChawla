import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Check, Calendar, Download, Tag, ExternalLink, Clock, Search } from 'lucide-react';
import useStore from '../store';

const Media = () => {
  const mediaData = useStore((state) => state.mediaData);
  const updateMediaData = useStore((state) => state.updateMediaData);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  // Ensure mediaData has the correct structure with default values
  const safeMediaData = {
    consumed: mediaData?.consumed || [],
    toConsume: mediaData?.toConsume || [],
    weeklyRecaps: mediaData?.weeklyRecaps || []
  };

  // Listen for cross-device sync events
  useEffect(() => {
    const handleSync = () => {
      reloadFromStorage();
    };

    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  // Local state
  const [activeSection, setActiveSection] = useState('tracker'); // 'tracker', 'toConsume', 'recap'
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTags, setNewMediaTags] = useState('');
  const [toConsumeInput, setToConsumeInput] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [fetchingTitles, setFetchingTitles] = useState(new Set());

  // Utility functions
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNumber;
  };

  const getCurrentWeek = () => getWeekNumber(new Date());

  const detectMediaType = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo')) {
      return 'video';
    } else if (lowerUrl.includes('spotify.com') || lowerUrl.includes('podcast') || lowerUrl.includes('soundcloud')) {
      return 'podcast';
    } else if (lowerUrl.includes('medium.com') || lowerUrl.includes('blog') || lowerUrl.includes('article')) {
      return 'article';
    } else if (lowerUrl.includes('github.com') || lowerUrl.includes('stackoverflow')) {
      return 'tutorial';
    } else {
      return 'other';
    }
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Fetch webpage title from URL
  const fetchWebpageTitle = async (url) => {
    try {
      // Use a CORS proxy or OpenGraph API to fetch title
      // For now, we'll extract from URL or use a placeholder
      // In production, you might want to use a backend service
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Try to extract a readable title from the URL
      if (pathname.length > 1) {
        const parts = pathname.split('/').filter(p => p);
        const lastPart = parts[parts.length - 1];
        // Remove file extensions and convert dashes/underscores to spaces
        const title = lastPart
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return title || urlObj.hostname;
      }

      return urlObj.hostname;
    } catch (error) {
      console.error('Error fetching title:', error);
      return url;
    }
  };

  // Get all previously used tags
  const getAllUsedTags = () => {
    const tags = new Set();
    safeMediaData.consumed.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };

  // Filter tag suggestions based on input
  const getTagSuggestions = (input) => {
    if (!input.trim()) return [];
    const allTags = getAllUsedTags();
    const inputLower = input.toLowerCase().trim();
    return allTags.filter(tag => tag.toLowerCase().includes(inputLower));
  };

  // Media consumption tracker handlers
  const addMediaItem = async () => {
    if (!newMediaUrl.trim()) return;

    const tags = newMediaTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const mediaType = detectMediaType(newMediaUrl);
    const currentWeek = getCurrentWeek();

    // Fetch webpage title
    const title = await fetchWebpageTitle(newMediaUrl.trim());

    const newItem = {
      id: generateId(),
      url: newMediaUrl.trim(),
      title: title,
      tags,
      mediaType,
      dateAdded: Date.now(),
      consumedDate: Date.now(),
      weekNumber: currentWeek,
      year: new Date().getFullYear()
    };

    updateMediaData({
      ...mediaData,
      consumed: [newItem, ...safeMediaData.consumed]
    });

    setNewMediaUrl('');
    setNewMediaTags('');
  };

  const deleteMediaItem = (id) => {
    updateMediaData({
      ...mediaData,
      consumed: safeMediaData.consumed.filter(item => item.id !== id)
    });
  };

  // To Consume list handlers (consolidated read/watch list)
  const addToConsumeList = async () => {
    if (!toConsumeInput.trim()) return;

    // Parse input - each line is a URL
    const lines = toConsumeInput.split('\n').filter(line => line.trim());

    const newItems = await Promise.all(lines.map(async (line) => {
      const url = line.trim();
      const title = await fetchWebpageTitle(url);

      return {
        id: generateId(),
        url: url,
        title: title,
        dateAdded: Date.now()
      };
    }));

    updateMediaData({
      ...mediaData,
      toConsume: [...newItems, ...safeMediaData.toConsume]
    });

    setToConsumeInput('');
  };

  const markAsConsumed = async (id) => {
    const item = safeMediaData.toConsume.find(i => i.id === id);
    if (!item) return;

    const currentWeek = getCurrentWeek();
    const mediaType = detectMediaType(item.url);

    const consumedItem = {
      ...item,
      tags: [],
      mediaType: mediaType,
      consumedDate: Date.now(),
      weekNumber: currentWeek,
      year: new Date().getFullYear()
    };

    updateMediaData({
      ...mediaData,
      toConsume: safeMediaData.toConsume.filter(i => i.id !== id),
      consumed: [consumedItem, ...safeMediaData.consumed]
    });
  };

  const deleteToConsumeItem = (id) => {
    updateMediaData({
      ...mediaData,
      toConsume: safeMediaData.toConsume.filter(item => item.id !== id)
    });
  };

  const refreshTitle = async (id, listType = 'toConsume') => {
    setFetchingTitles(prev => new Set([...prev, id]));

    const list = listType === 'toConsume' ? safeMediaData.toConsume : safeMediaData.consumed;
    const item = list.find(i => i.id === id);

    if (item) {
      const newTitle = await fetchWebpageTitle(item.url);
      const updatedList = list.map(i =>
        i.id === id ? { ...i, title: newTitle } : i
      );

      updateMediaData({
        ...mediaData,
        [listType]: updatedList
      });
    }

    setFetchingTitles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Weekly recap functionality
  const generateWeeklyRecap = () => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();

    // Get all items from current week
    const weekItems = safeMediaData.consumed.filter(
      item => item.weekNumber === currentWeek && item.year === currentYear
    );

    // Calculate statistics
    const statistics = {
      total: weekItems.length,
      byType: {},
      byTag: {}
    };

    weekItems.forEach(item => {
      // Count by type
      statistics.byType[item.mediaType] = (statistics.byType[item.mediaType] || 0) + 1;

      // Count by tags
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          statistics.byTag[tag] = (statistics.byTag[tag] || 0) + 1;
        });
      }
    });

    // Get week start and end dates
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const recap = {
      id: generateId(),
      weekNumber: currentWeek,
      year: currentYear,
      startDate: startOfWeek.getTime(),
      endDate: endOfWeek.getTime(),
      items: weekItems,
      statistics,
      generatedAt: Date.now()
    };

    // Check if recap already exists for this week
    const existingRecapIndex = safeMediaData.weeklyRecaps.findIndex(
      r => r.weekNumber === currentWeek && r.year === currentYear
    );

    let newRecaps;
    if (existingRecapIndex >= 0) {
      // Update existing recap
      newRecaps = [...safeMediaData.weeklyRecaps];
      newRecaps[existingRecapIndex] = recap;
    } else {
      // Add new recap
      newRecaps = [recap, ...safeMediaData.weeklyRecaps];
    }

    updateMediaData({
      ...mediaData,
      weeklyRecaps: newRecaps
    });

    setSelectedWeek(recap);
  };

  const deleteRecap = (recapId) => {
    updateMediaData({
      ...mediaData,
      weeklyRecaps: safeMediaData.weeklyRecaps.filter(r => r.id !== recapId)
    });

    if (selectedWeek && selectedWeek.id === recapId) {
      setSelectedWeek(null);
    }
  };

  const exportRecap = (recap) => {
    const content = `# Weekly Media Recap - Week ${recap.weekNumber}, ${recap.year}

## Summary
- **Total Items:** ${recap.statistics.total}
- **Period:** ${new Date(recap.startDate).toLocaleDateString()} - ${new Date(recap.endDate).toLocaleDateString()}

## By Type
${Object.entries(recap.statistics.byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

${Object.keys(recap.statistics.byTag).length > 0 ? `## By Tag
${Object.entries(recap.statistics.byTag).map(([tag, count]) => `- ${tag}: ${count}`).join('\n')}` : ''}

## Consumed Media
${recap.items.map((item, idx) => `
${idx + 1}. **${item.title}**
   - URL: ${item.url}
   - Type: ${item.mediaType}
   ${item.tags && item.tags.length > 0 ? `- Tags: ${item.tags.join(', ')}` : ''}
   - Date: ${new Date(item.consumedDate).toLocaleDateString()}
`).join('\n')}
`;

    // Create download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `media-recap-week${recap.weekNumber}-${recap.year}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get unique tags for filtering
  const getAllTags = () => {
    const tags = new Set();
    safeMediaData.consumed.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  };

  // Filter consumed items
  const getFilteredConsumedItems = () => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();

    let items = safeMediaData.consumed.filter(
      item => item.weekNumber === currentWeek && item.year === currentYear
    );

    if (filterTag !== 'all') {
      items = items.filter(item => item.tags && item.tags.includes(filterTag));
    }

    return items;
  };

  // Search recaps
  const searchRecaps = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results = [];

    safeMediaData.weeklyRecaps.forEach(recap => {
      const matchingItems = recap.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query)
      );

      if (matchingItems.length > 0) {
        results.push({
          recap,
          items: matchingItems
        });
      }
    });

    return results;
  };

  // Handle tag input with autocomplete
  const handleTagInput = (e) => {
    const value = e.target.value;
    setNewMediaTags(value);

    // Check if we should show suggestions
    const lastComma = value.lastIndexOf(',');
    const currentTag = lastComma >= 0 ? value.slice(lastComma + 1).trim() : value.trim();

    if (currentTag.length > 0) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  const addTagSuggestion = (tag) => {
    const lastComma = newMediaTags.lastIndexOf(',');
    let newValue;

    if (lastComma >= 0) {
      newValue = newMediaTags.slice(0, lastComma + 1) + ' ' + tag + ', ';
    } else {
      newValue = tag + ', ';
    }

    setNewMediaTags(newValue);
    setShowTagSuggestions(false);
  };

  const getCurrentTagInput = () => {
    const lastComma = newMediaTags.lastIndexOf(',');
    return lastComma >= 0 ? newMediaTags.slice(lastComma + 1).trim() : newMediaTags.trim();
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveSection('tracker')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'tracker'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Consumption Tracker
        </button>
        <button
          onClick={() => setActiveSection('toConsume')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'toConsume'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          To Consume
        </button>
        <button
          onClick={() => setActiveSection('recap')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'recap'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Weekly Recap
        </button>
      </div>

      {/* Media Consumption Tracker */}
      {activeSection === 'tracker' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add Consumed Media</h2>
            <div className="space-y-3">
              <input
                type="url"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMediaItem()}
                placeholder="Media URL..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="relative">
                <input
                  type="text"
                  value={newMediaTags}
                  onChange={handleTagInput}
                  onKeyPress={(e) => e.key === 'Enter' && addMediaItem()}
                  onFocus={() => getCurrentTagInput().length > 0 && setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder="Tags (comma-separated)..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {showTagSuggestions && getTagSuggestions(getCurrentTagInput()).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {getTagSuggestions(getCurrentTagInput()).map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTagSuggestion(tag)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addMediaItem}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Media
              </button>
            </div>
          </div>

          {/* Filter by tag */}
          {getAllTags().length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={18} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
                <button
                  onClick={() => setFilterTag('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filterTag === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {getAllTags().map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current week's consumed media */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
              <Calendar size={20} />
              This Week's Media (Week {getCurrentWeek()})
            </h3>
            <div className="space-y-3">
              {getFilteredConsumedItems().length === 0 ? (
                <p className="text-slate-500 text-center py-8">No media consumed this week</p>
              ) : (
                getFilteredConsumedItems().map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-2"
                        >
                          {item.title}
                          <ExternalLink size={14} />
                        </a>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            {item.mediaType}
                          </span>
                          {item.tags && item.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(item.consumedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMediaItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* To Consume List */}
      {activeSection === 'toConsume' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add to Queue</h2>
            <div className="space-y-3">
              <textarea
                value={toConsumeInput}
                onChange={(e) => setToConsumeInput(e.target.value)}
                placeholder="Paste URLs here (one per line)..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[150px] font-mono text-sm"
                rows="8"
              />
              <button
                onClick={addToConsumeList}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Queue
              </button>
            </div>
          </div>

          {/* To Consume Items */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Queue ({safeMediaData.toConsume.length})</h3>
            <div className="space-y-3">
              {safeMediaData.toConsume.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No items in queue</p>
              ) : (
                safeMediaData.toConsume.map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 mb-2"
                        >
                          {fetchingTitles.has(item.id) ? (
                            <span className="text-slate-400">Fetching title...</span>
                          ) : (
                            item.title
                          )}
                          <ExternalLink size={14} />
                        </a>
                        <span className="text-xs text-slate-500">
                          Added {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => refreshTitle(item.id, 'toConsume')}
                          className="text-slate-500 hover:text-slate-700 transition-all text-xs px-2 py-1 bg-slate-100 rounded"
                          title="Refresh title"
                          disabled={fetchingTitles.has(item.id)}
                        >
                          ↻
                        </button>
                        <button
                          onClick={() => markAsConsumed(item.id)}
                          className="text-purple-600 hover:text-purple-800 transition-all"
                          title="Mark as consumed"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => deleteToConsumeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Recap */}
      {activeSection === 'recap' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Weekly Recap</h2>
              <button
                onClick={generateWeeklyRecap}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2"
              >
                <Calendar size={18} />
                Generate This Week's Recap
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recaps by title..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="mt-3 space-y-2">
                  {searchRecaps().length === 0 ? (
                    <p className="text-slate-500 text-sm">No results found</p>
                  ) : (
                    searchRecaps().map(({ recap, items }) => (
                      <div key={recap.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Week {recap.weekNumber}, {recap.year} ({items.length} matches)
                        </p>
                        <div className="space-y-1">
                          {items.map(item => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-2 block"
                            >
                              {item.title}
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedWeek && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Week {selectedWeek.weekNumber}, {selectedWeek.year}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportRecap(selectedWeek)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2"
                    >
                      <Download size={14} />
                      Export
                    </button>
                    <button
                      onClick={() => setSelectedWeek(null)}
                      className="px-3 py-1 bg-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-400 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedWeek.statistics.total}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Period</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(selectedWeek.startDate).toLocaleDateString()} - {new Date(selectedWeek.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">By Type</p>
                    <div className="space-y-1">
                      {Object.entries(selectedWeek.statistics.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-slate-600">{type}</span>
                          <span className="font-medium text-slate-800">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {Object.keys(selectedWeek.statistics.byTag).length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">By Tag</p>
                      <div className="space-y-1">
                        {Object.entries(selectedWeek.statistics.byTag).map(([tag, count]) => (
                          <div key={tag} className="flex justify-between text-sm">
                            <span className="text-slate-600">{tag}</span>
                            <span className="font-medium text-slate-800">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedWeek.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-2"
                        >
                          {item.title}
                          <ExternalLink size={12} />
                        </a>
                        <span className="text-xs text-slate-500">{item.mediaType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Previous Recaps */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Previous Recaps</h3>
            <div className="space-y-3">
              {safeMediaData.weeklyRecaps.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recaps generated yet</p>
              ) : (
                safeMediaData.weeklyRecaps.map(recap => (
                  <div
                    key={recap.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedWeek(recap)}
                      >
                        <h4 className="font-medium text-slate-800">
                          Week {recap.weekNumber}, {recap.year}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {recap.statistics.total} items • {new Date(recap.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportRecap(recap);
                          }}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                          <Download size={14} />
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this recap?')) {
                              deleteRecap(recap.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
