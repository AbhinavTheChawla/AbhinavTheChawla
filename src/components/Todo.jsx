import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';

const Todo = () => {
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return defaultValue;
    }
  };

  const [notes, setNotes] = useState(() => loadFromStorage('todo_notes', []));
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const editorRef = useRef(null);
  const titleRef = useRef(null);

  // Auto-save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('todo_notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }, [notes]);

  // Select first note on mount if available
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, []);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setShowSidebar(false);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const deleteNote = (noteId, e) => {
    e?.stopPropagation();
    const filteredNotes = notes.filter(note => note.id !== noteId);
    setNotes(filteredNotes);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
  };

  const updateNote = (noteId, updates) => {
    setNotes(notes.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    updateNote(selectedNoteId, { title });
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    updateNote(selectedNoteId, { content });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getPreviewText = (content) => {
    const plainText = content.replace(/[#*_~`]/g, '').trim();
    return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      <div className="flex h-[600px] sm:h-[700px]">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex flex-col w-full sm:w-80 border-r border-slate-200 bg-slate-50/50`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-slate-800">Notes</h2>
              <button
                onClick={createNewNote}
                className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
                title="New Note"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">{searchQuery ? 'No notes found' : 'No notes yet'}</p>
                <p className="text-xs mt-2">Click + to create your first note</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setShowSidebar(false);
                    }}
                    className={`p-4 cursor-pointer transition-all duration-150 hover:bg-white/80 ${
                      selectedNoteId === note.id
                        ? 'bg-white border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate mb-1">
                          {note.title || 'New Note'}
                        </h3>
                        <p className="text-xs text-slate-500 mb-2">
                          {formatTimestamp(note.updatedAt)}
                        </p>
                        {note.content && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {getPreviewText(note.content)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteNote(note.id, e)}
                        className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className={`${showSidebar ? 'hidden' : 'flex'} sm:flex flex-col flex-1 bg-white`}>
          {selectedNote ? (
            <>
              {/* Mobile back button */}
              <div className="sm:hidden p-4 border-b border-slate-200">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Notes
                </button>
              </div>

              {/* Title Input */}
              <div className="p-6 border-b border-slate-200">
                <input
                  ref={titleRef}
                  type="text"
                  value={selectedNote.title}
                  onChange={handleTitleChange}
                  placeholder="Title"
                  className="w-full text-2xl font-bold text-slate-800 bg-transparent border-0 focus:outline-none placeholder-slate-400"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {formatTimestamp(selectedNote.updatedAt)}
                </p>
              </div>

              {/* Content Textarea */}
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea
                  ref={editorRef}
                  value={selectedNote.content}
                  onChange={handleContentChange}
                  placeholder="Start typing..."
                  className="w-full h-full text-base text-slate-700 bg-transparent border-0 focus:outline-none resize-none placeholder-slate-400 leading-relaxed"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Todo;
