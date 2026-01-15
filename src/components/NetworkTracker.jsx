import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check, ExternalLink, Users, Calendar, Search, Trash2, ArrowUpDown } from 'lucide-react';
import useStore from '../store';

const NetworkTracker = () => {
  const networkData = useStore((state) => state.networkData);
  const updateNetworkData = useStore((state) => state.updateNetworkData);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'last_contact_date', direction: 'desc' });
  const [filterType, setFilterType] = useState('all'); // all, existing, target
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, dormant, pending_outreach

  // New contact form state
  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    position: '',
    location: '',
    linkedin_url: '',
    notes: '',
    contact_type: 'existing', // existing or target
    status: 'active' // active, dormant, pending_outreach
  });

  // Calculate days since last contact
  const getDaysSinceContact = (lastContactDate) => {
    if (!lastContactDate) return null;
    const today = new Date();
    const lastContact = new Date(lastContactDate);
    const diffTime = Math.abs(today - lastContact);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get color based on days since last contact
  const getContactColor = (lastContactDate) => {
    const days = getDaysSinceContact(lastContactDate);
    if (days === null) return 'bg-slate-50'; // No contact date
    if (days < 30) return 'bg-green-50';
    if (days < 90) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // Add new contact
  const addContact = () => {
    if (!newContact.name.trim()) return;

    const contact = {
      id: Date.now(),
      ...newContact,
      date_added: new Date().toISOString().split('T')[0],
      last_contact_date: newContact.contact_type === 'existing' ? new Date().toISOString().split('T')[0] : null
    };

    updateNetworkData({
      ...networkData,
      contacts: [...networkData.contacts, contact]
    });

    // Reset form
    setNewContact({
      name: '',
      company: '',
      position: '',
      location: '',
      linkedin_url: '',
      notes: '',
      contact_type: 'existing',
      status: 'active'
    });
    setShowAddModal(false);
  };

  // Update contact field
  const updateContactField = (contactId, field, value) => {
    const updatedContacts = networkData.contacts.map(contact =>
      contact.id === contactId ? { ...contact, [field]: value } : contact
    );
    updateNetworkData({
      ...networkData,
      contacts: updatedContacts
    });
  };

  // Delete contact
  const deleteContact = (contactId) => {
    const updatedContacts = networkData.contacts.filter(c => c.id !== contactId);
    const updatedPlanner = networkData.weeklyPlanner.filter(id => id !== contactId);
    updateNetworkData({
      contacts: updatedContacts,
      weeklyPlanner: updatedPlanner
    });
  };

  // Add to weekly planner
  const addToWeeklyPlanner = (contactId) => {
    if (networkData.weeklyPlanner.length >= 3) {
      alert('Weekly planner is full! Maximum 3 contacts.');
      return;
    }
    if (networkData.weeklyPlanner.includes(contactId)) {
      alert('Contact already in weekly planner!');
      return;
    }
    updateNetworkData({
      ...networkData,
      weeklyPlanner: [...networkData.weeklyPlanner, contactId]
    });
  };

  // Remove from weekly planner
  const removeFromWeeklyPlanner = (contactId) => {
    updateNetworkData({
      ...networkData,
      weeklyPlanner: networkData.weeklyPlanner.filter(id => id !== contactId)
    });
  };

  // Mark as contacted (update last_contact_date and remove from planner)
  const markAsContacted = (contactId) => {
    const today = new Date().toISOString().split('T')[0];
    updateContactField(contactId, 'last_contact_date', today);
    removeFromWeeklyPlanner(contactId);
  };

  // Clear weekly planner
  const clearWeeklyPlanner = () => {
    if (window.confirm('Clear all contacts from weekly planner?')) {
      updateNetworkData({
        ...networkData,
        weeklyPlanner: []
      });
    }
  };

  // Sort contacts
  const sortContacts = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered contacts
  const getFilteredContacts = () => {
    let filtered = [...networkData.contacts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(contact => contact.contact_type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(contact => contact.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle dates
      if (sortConfig.key === 'last_contact_date' || sortConfig.key === 'date_added') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Get weekly planner contacts
  const getWeeklyPlannerContacts = () => {
    return networkData.weeklyPlanner
      .map(id => networkData.contacts.find(c => c.id === id))
      .filter(c => c !== undefined);
  };

  // Calculate mix indicator
  const getMixIndicator = () => {
    const plannerContacts = getWeeklyPlannerContacts();
    const existingCount = plannerContacts.filter(c => c.contact_type === 'existing').length;
    const targetCount = plannerContacts.filter(c => c.contact_type === 'target').length;
    return { existingCount, targetCount, total: plannerContacts.length };
  };

  const mixIndicator = getMixIndicator();
  const filteredContacts = getFilteredContacts();

  return (
    <div className="space-y-6">
      {/* Weekly Planner Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Catch Up This Week</h2>
              <p className="text-sm text-slate-500">Schedule up to 3 contacts to catch up with</p>
            </div>
          </div>
          {networkData.weeklyPlanner.length > 0 && (
            <button
              onClick={clearWeeklyPlanner}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Progress: {mixIndicator.total}/3 scheduled
            </span>
            <span className="text-xs text-slate-500">
              {mixIndicator.existingCount} existing • {mixIndicator.targetCount} target
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(mixIndicator.total / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Weekly Planner Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(index => {
            const contact = getWeeklyPlannerContacts()[index];
            return (
              <div
                key={index}
                className={`p-4 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  contact
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                {contact ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{contact.name}</h3>
                        <p className="text-sm text-slate-600 truncate">{contact.company}</p>
                        <p className="text-xs text-slate-500 truncate">{contact.position}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                          contact.contact_type === 'existing'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {contact.contact_type === 'existing' ? 'Existing' : 'Target'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromWeeklyPlanner(contact.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove from planner"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => markAsContacted(contact.id)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Mark as Done
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-slate-400 mb-2">
                      <Calendar size={32} className="mx-auto opacity-50" />
                    </div>
                    <p className="text-sm text-slate-500">Slot {index + 1}</p>
                    <p className="text-xs text-slate-400">Empty</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Network Contacts</h2>
                <p className="text-sm text-slate-500">{filteredContacts.length} contacts</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
            >
              <Plus size={18} />
              Add Contact
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="existing">Existing</option>
              <option value="target">Target</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="dormant">Dormant</option>
              <option value="pending_outreach">Pending Outreach</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">
                  <button
                    onClick={() => sortContacts('name')}
                    className="flex items-center gap-1 hover:text-indigo-200 transition-colors"
                  >
                    Name <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="p-3 text-left text-sm font-semibold">
                  <button
                    onClick={() => sortContacts('company')}
                    className="flex items-center gap-1 hover:text-indigo-200 transition-colors"
                  >
                    Company <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="p-3 text-left text-sm font-semibold">Position</th>
                <th className="p-3 text-left text-sm font-semibold">Location</th>
                <th className="p-3 text-left text-sm font-semibold">
                  <button
                    onClick={() => sortContacts('last_contact_date')}
                    className="flex items-center gap-1 hover:text-indigo-200 transition-colors"
                  >
                    Last Contact <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="p-3 text-left text-sm font-semibold">Type</th>
                <th className="p-3 text-left text-sm font-semibold">Status</th>
                <th className="p-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, idx) => (
                <tr
                  key={contact.id}
                  className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors duration-150 ${getContactColor(contact.last_contact_date)} ${
                    idx % 2 === 0 ? '' : 'bg-slate-50/30'
                  }`}
                >
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContactField(contact.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{contact.name}</span>
                        {contact.linkedin_url && (
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <input
                        type="text"
                        value={contact.company}
                        onChange={(e) => updateContactField(contact.id, 'company', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{contact.company}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => updateContactField(contact.id, 'position', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    ) : (
                      <span className="text-sm text-slate-600">{contact.position}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <input
                        type="text"
                        value={contact.location}
                        onChange={(e) => updateContactField(contact.id, 'location', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    ) : (
                      <span className="text-sm text-slate-600">{contact.location}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-slate-700">
                      {contact.last_contact_date ? (
                        <>
                          {contact.last_contact_date}
                          <span className="block text-xs text-slate-500">
                            {getDaysSinceContact(contact.last_contact_date)} days ago
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </span>
                  </td>
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <select
                        value={contact.contact_type}
                        onChange={(e) => updateContactField(contact.id, 'contact_type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      >
                        <option value="existing">Existing</option>
                        <option value="target">Target</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        contact.contact_type === 'existing'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {contact.contact_type === 'existing' ? 'Existing' : 'Target'}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingContact === contact.id ? (
                      <select
                        value={contact.status}
                        onChange={(e) => updateContactField(contact.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="dormant">Dormant</option>
                        <option value="pending_outreach">Pending Outreach</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        contact.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : contact.status === 'dormant'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {contact.status.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {editingContact === contact.id ? (
                        <button
                          onClick={() => setEditingContact(null)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingContact(contact.id)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => addToWeeklyPlanner(contact.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Add to weekly planner"
                        disabled={networkData.weeklyPlanner.includes(contact.id)}
                      >
                        <Calendar size={16} />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No contacts found</p>
              <p className="text-sm text-slate-400">Add your first contact to get started!</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-xl border border-slate-200 ${getContactColor(contact.last_contact_date)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{contact.name}</h3>
                    {contact.linkedin_url && (
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{contact.company}</p>
                  <p className="text-xs text-slate-500">{contact.position}</p>
                  <p className="text-xs text-slate-500">{contact.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.contact_type === 'existing'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {contact.contact_type === 'existing' ? 'Existing' : 'Target'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : contact.status === 'dormant'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {contact.status.replace('_', ' ')}
                </span>
                {contact.last_contact_date && (
                  <span className="text-xs text-slate-500">
                    Last contact: {getDaysSinceContact(contact.last_contact_date)}d ago
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToWeeklyPlanner(contact.id)}
                  className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-lg hover:bg-indigo-200 transition-colors"
                  disabled={networkData.weeklyPlanner.includes(contact.id)}
                >
                  Add to Planner
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No contacts found</p>
              <p className="text-sm text-slate-400">Add your first contact to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={newContact.position}
                    onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                    placeholder="Senior Developer"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newContact.location}
                  onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={newContact.linkedin_url}
                  onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Type</label>
                  <select
                    value={newContact.contact_type}
                    onChange={(e) => setNewContact({ ...newContact, contact_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  >
                    <option value="existing">Existing Contact</option>
                    <option value="target">Target Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newContact.status}
                    onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="dormant">Dormant</option>
                    <option value="pending_outreach">Pending Outreach</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Add any notes about this contact..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                disabled={!newContact.name.trim()}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkTracker;
