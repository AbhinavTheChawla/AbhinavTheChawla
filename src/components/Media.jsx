import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Check, Star, Calendar, Download, Tag, ExternalLink, Clock } from 'lucide-react';
import useStore from '../store';

const Media = () => {
  const mediaData = useStore((state) => state.mediaData);
  const updateMediaData = useStore((state) => state.updateMediaData);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  // Listen for cross-device sync events
  useEffect(() => {
    const handleSync = () => {
      reloadFromStorage();
    };

    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  // Local state
  const [activeSection, setActiveSection] = useState('tracker'); // 'tracker', 'readList', 'watchList', 'recap'
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTags, setNewMediaTags] = useState('');
  const [readListUrl, setReadListUrl] = useState('');
  const [readListTitle, setReadListTitle] = useState('');
  const [readListNotes, setReadListNotes] = useState('');
  const [readListPriority, setReadListPriority] = useState('medium');
  const [watchListUrl, setWatchListUrl] = useState('');
  const [watchListTitle, setWatchListTitle] = useState('');
  const [watchListPlatform, setWatchListPlatform] = useState('');
  const [watchListNotes, setWatchListNotes] = useState('');
  const [watchListEpisode, setWatchListEpisode] = useState('');
  const [watchListSeason, setWatchListSeason] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState(null);

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

  // Media consumption tracker handlers
  const addMediaItem = () => {
    if (!newMediaUrl.trim()) return;

    const tags = newMediaTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const mediaType = detectMediaType(newMediaUrl);
    const currentWeek = getCurrentWeek();

    const newItem = {
      id: generateId(),
      url: newMediaUrl.trim(),
      title: newMediaUrl.trim(),
      tags,
      mediaType,
      dateAdded: Date.now(),
      consumedDate: Date.now(),
      weekNumber: currentWeek,
      year: new Date().getFullYear()
    };

    updateMediaData({
      ...mediaData,
      consumed: [newItem, ...mediaData.consumed]
    });

    setNewMediaUrl('');
    setNewMediaTags('');
  };

  const deleteMediaItem = (id) => {
    updateMediaData({
      ...mediaData,
      consumed: mediaData.consumed.filter(item => item.id !== id)
    });
  };

  // Read list handlers
  const addToReadList = () => {
    if (!readListUrl.trim()) return;

    const newItem = {
      id: generateId(),
      url: readListUrl.trim(),
      title: readListTitle.trim() || readListUrl.trim(),
      notes: readListNotes.trim(),
      priority: readListPriority,
      dateAdded: Date.now()
    };

    updateMediaData({
      ...mediaData,
      readList: [newItem, ...mediaData.readList]
    });

    setReadListUrl('');
    setReadListTitle('');
    setReadListNotes('');
    setReadListPriority('medium');
  };

  const markAsRead = (id) => {
    const item = mediaData.readList.find(i => i.id === id);
    if (!item) return;

    const currentWeek = getCurrentWeek();
    const consumedItem = {
      ...item,
      tags: ['article', 'read'],
      mediaType: 'article',
      consumedDate: Date.now(),
      weekNumber: currentWeek,
      year: new Date().getFullYear()
    };

    updateMediaData({
      ...mediaData,
      readList: mediaData.readList.filter(i => i.id !== id),
      consumed: [consumedItem, ...mediaData.consumed]
    });
  };

  const deleteReadItem = (id) => {
    updateMediaData({
      ...mediaData,
      readList: mediaData.readList.filter(item => item.id !== id)
    });
  };

  // Watch list handlers
  const addToWatchList = () => {
    if (!watchListUrl.trim()) return;

    const newItem = {
      id: generateId(),
      url: watchListUrl.trim(),
      title: watchListTitle.trim() || watchListUrl.trim(),
      platform: watchListPlatform.trim(),
      notes: watchListNotes.trim(),
      episode: watchListEpisode.trim(),
      season: watchListSeason.trim(),
      dateAdded: Date.now()
    };

    updateMediaData({
      ...mediaData,
      watchList: [newItem, ...mediaData.watchList]
    });

    setWatchListUrl('');
    setWatchListTitle('');
    setWatchListPlatform('');
    setWatchListNotes('');
    setWatchListEpisode('');
    setWatchListSeason('');
  };

  const markAsWatched = (id) => {
    const item = mediaData.watchList.find(i => i.id === id);
    if (!item) return;

    const currentWeek = getCurrentWeek();
    const consumedItem = {
      ...item,
      tags: ['video', 'watched'],
      mediaType: 'video',
      consumedDate: Date.now(),
      weekNumber: currentWeek,
      year: new Date().getFullYear()
    };

    updateMediaData({
      ...mediaData,
      watchList: mediaData.watchList.filter(i => i.id !== id),
      consumed: [consumedItem, ...mediaData.consumed]
    });
  };

  const deleteWatchItem = (id) => {
    updateMediaData({
      ...mediaData,
      watchList: mediaData.watchList.filter(item => item.id !== id)
    });
  };

  // Weekly recap functionality
  const generateWeeklyRecap = () => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();

    // Get all items from current week
    const weekItems = mediaData.consumed.filter(
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
      item.tags.forEach(tag => {
        statistics.byTag[tag] = (statistics.byTag[tag] || 0) + 1;
      });
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
      weekNumber: currentWeek,
      year: currentYear,
      startDate: startOfWeek.getTime(),
      endDate: endOfWeek.getTime(),
      items: weekItems,
      statistics,
      generatedAt: Date.now()
    };

    // Check if recap already exists for this week
    const existingRecapIndex = mediaData.weeklyRecaps.findIndex(
      r => r.weekNumber === currentWeek && r.year === currentYear
    );

    let newRecaps;
    if (existingRecapIndex >= 0) {
      // Update existing recap
      newRecaps = [...mediaData.weeklyRecaps];
      newRecaps[existingRecapIndex] = recap;
    } else {
      // Add new recap
      newRecaps = [recap, ...mediaData.weeklyRecaps];
    }

    updateMediaData({
      ...mediaData,
      weeklyRecaps: newRecaps
    });

    setSelectedWeek(recap);
  };

  const exportRecap = (recap) => {
    const content = `# Weekly Media Recap - Week ${recap.weekNumber}, ${recap.year}

## Summary
- **Total Items:** ${recap.statistics.total}
- **Period:** ${new Date(recap.startDate).toLocaleDateString()} - ${new Date(recap.endDate).toLocaleDateString()}

## By Type
${Object.entries(recap.statistics.byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## By Tag
${Object.entries(recap.statistics.byTag).map(([tag, count]) => `- ${tag}: ${count}`).join('\n')}

## Consumed Media
${recap.items.map((item, idx) => `
${idx + 1}. **${item.title}**
   - Type: ${item.mediaType}
   - Tags: ${item.tags.join(', ')}
   - URL: ${item.url}
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

  // Get unique tags
  const getAllTags = () => {
    const tags = new Set();
    mediaData.consumed.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  // Filter consumed items
  const getFilteredConsumedItems = () => {
    const currentWeek = getCurrentWeek();
    const currentYear = new Date().getFullYear();

    let items = mediaData.consumed.filter(
      item => item.weekNumber === currentWeek && item.year === currentYear
    );

    if (filterTag !== 'all') {
      items = items.filter(item => item.tags.includes(filterTag));
    }

    return items;
  };

  // Sort functions
  const sortReadListByPriority = (items) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const sortByDateAdded = (items) => {
    return [...items].sort((a, b) => b.dateAdded - a.dateAdded);
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
          onClick={() => setActiveSection('readList')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'readList'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Read List
        </button>
        <button
          onClick={() => setActiveSection('watchList')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeSection === 'watchList'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Watch List
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
              <input
                type="text"
                value={newMediaTags}
                onChange={(e) => setNewMediaTags(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMediaItem()}
                placeholder="Tags (comma-separated)..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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
                          {item.tags.map(tag => (
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

      {/* Read List */}
      {activeSection === 'readList' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add to Read List</h2>
            <div className="space-y-3">
              <input
                type="url"
                value={readListUrl}
                onChange={(e) => setReadListUrl(e.target.value)}
                placeholder="Article URL..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                value={readListTitle}
                onChange={(e) => setReadListTitle(e.target.value)}
                placeholder="Title (optional)..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <textarea
                value={readListNotes}
                onChange={(e) => setReadListNotes(e.target.value)}
                placeholder="Notes (optional)..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                rows="2"
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-slate-700">Priority:</label>
                <select
                  value={readListPriority}
                  onChange={(e) => setReadListPriority(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                onClick={addToReadList}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Read List
              </button>
            </div>
          </div>

          {/* Read List Items */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Reading Queue</h3>
            <div className="space-y-3">
              {sortReadListByPriority(mediaData.readList).length === 0 ? (
                <p className="text-slate-500 text-center py-8">No items in read list</p>
              ) : (
                sortReadListByPriority(mediaData.readList).map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2"
                          >
                            {item.title}
                            <ExternalLink size={14} />
                          </a>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-slate-600 mb-2">{item.notes}</p>
                        )}
                        <span className="text-xs text-slate-500">
                          Added {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="text-green-600 hover:text-green-800 transition-all"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => deleteReadItem(item.id)}
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

      {/* Watch List */}
      {activeSection === 'watchList' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Add to Watch List</h2>
            <div className="space-y-3">
              <input
                type="url"
                value={watchListUrl}
                onChange={(e) => setWatchListUrl(e.target.value)}
                placeholder="Video URL..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                value={watchListTitle}
                onChange={(e) => setWatchListTitle(e.target.value)}
                placeholder="Title (optional)..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={watchListPlatform}
                  onChange={(e) => setWatchListPlatform(e.target.value)}
                  placeholder="Platform (e.g., YouTube)..."
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={watchListSeason}
                    onChange={(e) => setWatchListSeason(e.target.value)}
                    placeholder="S1..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    value={watchListEpisode}
                    onChange={(e) => setWatchListEpisode(e.target.value)}
                    placeholder="E1..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <textarea
                value={watchListNotes}
                onChange={(e) => setWatchListNotes(e.target.value)}
                placeholder="Notes (optional)..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                rows="2"
              />
              <button
                onClick={addToWatchList}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Watch List
              </button>
            </div>
          </div>

          {/* Watch List Items */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Watch Queue</h3>
            <div className="space-y-3">
              {sortByDateAdded(mediaData.watchList).length === 0 ? (
                <p className="text-slate-500 text-center py-8">No items in watch list</p>
              ) : (
                sortByDateAdded(mediaData.watchList).map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 mb-2"
                        >
                          {item.title}
                          <ExternalLink size={14} />
                        </a>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {item.platform && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {item.platform}
                            </span>
                          )}
                          {item.season && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                              {item.season}
                            </span>
                          )}
                          {item.episode && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                              {item.episode}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-slate-600 mb-2">{item.notes}</p>
                        )}
                        <span className="text-xs text-slate-500">
                          Added {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAsWatched(item.id)}
                          className="text-purple-600 hover:text-purple-800 transition-all"
                          title="Mark as watched"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => deleteWatchItem(item.id)}
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

            {selectedWeek && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Week {selectedWeek.weekNumber}, {selectedWeek.year}
                  </h3>
                  <button
                    onClick={() => exportRecap(selectedWeek)}
                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2"
                  >
                    <Download size={14} />
                    Export
                  </button>
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
              {mediaData.weeklyRecaps.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recaps generated yet</p>
              ) : (
                mediaData.weeklyRecaps.map(recap => (
                  <div
                    key={`${recap.year}-${recap.weekNumber}`}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedWeek(recap)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800">
                          Week {recap.weekNumber}, {recap.year}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {recap.statistics.total} items • {new Date(recap.startDate).toLocaleDateString()}
                        </p>
                      </div>
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
