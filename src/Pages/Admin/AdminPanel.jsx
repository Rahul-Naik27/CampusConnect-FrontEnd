import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import axios from 'axios';
import { API_BASE } from '../../api';
import { RegistrationsTimeline, TicketBreakdownPie, EventCapacityBar } from '../../components/AnalyticsCharts';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [chartsData, setChartsData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    departmentOrClub: '',
    venue: '',
    startAt: '',
    endAt: '',
    capacity: 100,
    isBiggestFest: false,
    status: 'PUBLISHED',
    ticketTypes: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [posterUploading, setPosterUploading] = useState(false);
  const posterInputRef = useRef(null);
  const [attendeesModal, setAttendeesModal] = useState(null); // { event, list }
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchStats();
    fetchCharts();
  }, []);

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Poster file too large. Max 5MB.' });
      return;
    }
    const data = new FormData();
    data.append('poster', file);
    setPosterUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/upload/poster`, data, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
      });
      setFormData(prev => ({ ...prev, posterUrl: res.data.url }));
      setMessage({ type: 'success', text: '🖼️ Poster uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Poster upload failed.' });
    } finally {
      setPosterUploading(false);
    }
  };

  const fetchAttendees = async (event) => {
    setAttendeesLoading(true);
    setAttendeesModal({ event, list: [] });
    try {
      const { data } = await api.get(`/admin/events/${event._id}/attendees`);
      setAttendeesModal({ event, list: data || [] });
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      setAttendeesModal({ event, list: [] });
    } finally {
      setAttendeesLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/admin/events/all');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCharts = async () => {
    try {
      const { data } = await api.get('/admin/stats/charts');
      setChartsData(data);
    } catch (err) {
      console.error('Charts data failed:', err);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter an event title first before generating a description.' });
      return;
    }
    setAiLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/admin/ai/generate-description', {
        title: formData.title,
        department: formData.departmentOrClub,
        venue: formData.venue,
        date: formData.startAt ? new Date(formData.startAt).toLocaleDateString() : '',
      });
      setFormData(prev => ({ ...prev, description: data.description }));
      setMessage({ type: 'success', text: '✨ AI description generated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'AI generation failed. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.departmentOrClub.trim()) return 'Department/Club is required';
    if (!formData.venue.trim()) return 'Venue is required';
    if (!formData.startAt || !formData.endAt) return 'Start and end date/time are required';
    const start = new Date(formData.startAt);
    const end = new Date(formData.endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid start or end date';
    if (start >= end) return 'Start date must be before end date';
    if (!Number.isInteger(Number(formData.capacity)) || Number(formData.capacity) <= 0) return 'Capacity must be a positive integer';
    for (let i = 0; i < formData.ticketTypes.length; i++) {
      const t = formData.ticketTypes[i];
      if (!t.name || String(t.name).trim() === '') return `Ticket type #${i + 1} needs a name`;
      if (isNaN(Number(t.price)) || Number(t.price) < 0) return `Ticket type #${i + 1} has invalid price`;
      if (!Number.isInteger(Number(t.quota)) || Number(t.quota) < 0) return `Ticket type #${i + 1} has invalid quota`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const errMsg = validateForm();
    if (errMsg) { setMessage({ type: 'error', text: errMsg }); return; }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        capacity: Number(formData.capacity),
        ticketTypes: (formData.ticketTypes || []).map(t => ({
          name: String(t.name).trim(),
          price: Number(t.price || 0),
          quota: Number(t.quota || 0)
        }))
      };
      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent._id}`, payload);
        setMessage({ type: 'success', text: 'Event updated successfully!' });
      } else {
        await api.post('/admin/events', payload);
        setMessage({ type: 'success', text: 'Event created successfully!' });
      }
      await fetchEvents();
      await fetchStats();
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      posterUrl: event.posterUrl || '',
      departmentOrClub: event.departmentOrClub || '',
      venue: event.venue || '',
      startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
      endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
      capacity: event.capacity || 100,
      isBiggestFest: !!event.isBiggestFest,
      status: event.status || 'PUBLISHED',
      ticketTypes: Array.isArray(event.ticketTypes) ? event.ticketTypes.map(t => ({ name: t.name || '', price: Number(t.price || 0), quota: Number(t.quota || 0) })) : []
    });
    setShowForm(true);
    setActiveTab('events');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setMessage({ type: 'success', text: 'Event deleted successfully!' });
      await fetchEvents();
      await fetchStats();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete event' });
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', posterUrl: '', departmentOrClub: '', venue: '', startAt: '', endAt: '', capacity: 100, isBiggestFest: false, status: 'PUBLISHED', ticketTypes: [] });
    setShowForm(false);
  };

  const addTicketType = () => setFormData(prev => ({ ...prev, ticketTypes: [...(prev.ticketTypes || []), { name: '', price: 0, quota: 0 }] }));
  const updateTicketType = (index, field, value) => {
    setFormData(prev => {
      const updated = (prev.ticketTypes || []).map(t => ({ ...t }));
      updated[index][field] = field === 'name' ? String(value) : Number(value);
      return { ...prev, ticketTypes: updated };
    });
  };
  const removeTicketType = (index) => setFormData(prev => ({ ...prev, ticketTypes: (prev.ticketTypes || []).filter((_, i) => i !== index) }));
  const toggleForm = () => { if (!showForm) { resetForm(); setShowForm(true); } else { resetForm(); } };

  // ── Stats Card Component ──
  const StatCard = ({ icon, label, value, color, sub }) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-black text-gray-800">{value ?? '—'}</span>
      </div>
      <div className="text-sm font-semibold text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-3 flex-wrap">
            {/* Tab Switcher */}
            <div className="flex bg-white rounded-xl shadow p-1 gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50'}`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'events' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50'}`}
              >
                🎫 Events
              </button>
            </div>
            {activeTab === 'events' && (
              <button
                onClick={toggleForm}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {showForm ? 'Cancel' : '+ Create Event'}
              </button>
            )}
          </div>
        </div>

        {/* Global Message */}
        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            {statsLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-4 text-purple-600 font-semibold">Loading stats...</span>
              </div>
            ) : stats ? (
              <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon="🎭" label="Total Events" value={stats.totalEvents} color="border-purple-500" />
                  <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="border-blue-500" />
                  <StatCard icon="🎫" label="Registrations" value={stats.totalRegistrations} color="border-green-500" />
                  <StatCard icon="✅" label="Check-Ins" value={stats.totalCheckIns} color="border-teal-500" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard icon="💰" label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="border-yellow-500" />
                  <StatCard icon="⭐" label="Avg Rating" value={stats.avgRating ?? 'N/A'} color="border-orange-500" sub={`from ${stats.totalFeedbacks} reviews`} />
                  <StatCard
                    icon="📈"
                    label="Show-up Rate"
                    value={stats.totalRegistrations > 0 ? `${Math.round((stats.totalCheckIns / stats.totalRegistrations) * 100)}%` : 'N/A'}
                    color="border-indigo-500"
                    sub="Check-ins / Registrations"
                  />
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-4">📈 Registrations (Last 7 Days)</h2>
                    <RegistrationsTimeline data={chartsData?.timeline} />
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-4">🎟 Ticket Type Breakdown</h2>
                    <TicketBreakdownPie data={chartsData?.ticketBreakdown} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-base font-bold text-gray-800 mb-4">📊 Registrations vs Capacity (Top Events)</h2>
                  <EventCapacityBar data={stats?.topEvents} />
                </div>

                {/* Top Events */}
                {stats.topEvents && stats.topEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-5">🏆 Top Events by Registrations</h2>
                    <div className="space-y-3">
                      {stats.topEvents.map((ev, i) => {
                        const pct = ev.capacity > 0 ? Math.round((ev.count / ev.capacity) * 100) : 0;
                        const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500'];
                        return (
                          <div key={ev._id} className="flex items-center gap-4">
                            <div className="w-6 text-center font-black text-gray-400 text-sm">#{i + 1}</div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">{ev.title}</span>
                                <span className="text-sm font-bold text-gray-500 ml-2">{ev.count}/{ev.capacity}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${colors[i] || 'bg-purple-500'} transition-all duration-700`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-sm font-bold text-gray-500 w-10 text-right">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={fetchStats} className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2">
                    🔄 Refresh Stats
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">Failed to load stats. <button onClick={fetchStats} className="text-purple-600 underline">Retry</button></div>
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === 'events' && (
          <div>
            {/* Create / Edit Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department/Club *</label>
                      <input
                        type="text"
                        required
                        value={formData.departmentOrClub}
                        onChange={(e) => setFormData({ ...formData, departmentOrClub: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                      <input
                        type="text"
                        required
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                      <input
                        type="number"
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startAt}
                        onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endAt}
                        onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image</label>
                      <div className="space-y-2">
                        {/* File upload button */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => posterInputRef.current?.click()}
                            disabled={posterUploading}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                          >
                            {posterUploading ? <><span className="animate-spin">⏳</span> Uploading...</> : '📤 Upload Poster'}
                          </button>
                          <input
                            ref={posterInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePosterUpload}
                          />
                          {formData.posterUrl?.startsWith('http') && (
                            <span className="text-xs text-green-600 font-bold">✅ Uploaded</span>
                          )}
                        </div>
                        {/* OR URL input */}
                        <input
                          type="url"
                          value={formData.posterUrl}
                          onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                          placeholder="or paste image URL here…"
                        />
                        {formData.posterUrl && (
                          <img src={formData.posterUrl} alt="Preview" className="h-24 rounded-lg object-cover border border-gray-200" onError={(e) => e.target.style.display='none'} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description with AI Generate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                      >
                        {aiLoading ? (
                          <><span className="animate-spin">⏳</span> Generating...</>
                        ) : (
                          <>✨ AI Generate</>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      placeholder="Write a description or click ✨ AI Generate to auto-fill..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Tip: Fill in the Title and Department first, then click ✨ AI Generate for the best result.
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBiggestFest"
                      checked={formData.isBiggestFest}
                      onChange={(e) => setFormData({ ...formData, isBiggestFest: e.target.checked })}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isBiggestFest" className="ml-2 text-sm font-medium text-gray-700">
                      Mark as Featured Event (Shows on homepage)
                    </label>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">Ticket Types</label>
                      <button
                        type="button"
                        onClick={addTicketType}
                        className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                      >
                        + Add Ticket Type
                      </button>
                    </div>

                    {formData.ticketTypes.map((ticket, index) => (
                      <div key={index} className="flex flex-col gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Ticket Type</label>
                          <input
                            type="text"
                            placeholder="Name (e.g., General, VIP)"
                            value={ticket.name}
                            onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                            <input type="number" placeholder="Price" value={ticket.price} onChange={(e) => updateTicketType(index, 'price', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600" min={0} />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Seats Available</label>
                            <input type="number" placeholder="Quota" value={ticket.quota} onChange={(e) => updateTicketType(index, 'quota', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600" min={0} />
                          </div>
                        </div>
                        <button type="button" onClick={() => removeTicketType(index)} className="self-end text-red-600 hover:text-red-700 font-bold px-3 py-1">✕ Remove</button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                  </button>
                </form>
              </div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event._id} className="bg-white rounded-xl shadow-lg p-6">
                  {event.posterUrl && (
                    <img src={event.posterUrl} alt={event.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div>📍 {event.venue}</div>
                    <div>📅 {event.startAt ? new Date(event.startAt).toLocaleDateString() : '—'}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleEdit(event)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm">Edit</button>
                    <button onClick={() => fetchAttendees(event)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition text-sm">👥 Attendees</button>
                    <button onClick={() => handleDelete(event._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Attendees Modal ── */}
      {attendeesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAttendeesModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-white font-black text-lg">👥 Attendees</h3>
                <p className="text-purple-200 text-sm truncate max-w-xs">{attendeesModal.event.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {attendeesModal.list.length > 0 && (
                  <button
                    onClick={() => {
                      const rows = ['Name,Email,Roll No,Branch,Checked In'];
                      attendeesModal.list.forEach(r => {
                        rows.push(`"${r.userId?.name || ''}","${r.userId?.email || ''}","${r.userId?.rollNumber || ''}","${r.userId?.branch || ''}","${r.checkedInAt ? 'Yes' : 'No'}"`);
                      });
                      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                      a.download = `${attendeesModal.event.title.replace(/\s+/g,'-')}-attendees.csv`; a.click();
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                  >
                    ⬇️ CSV
                  </button>
                )}
                <button onClick={() => setAttendeesModal(null)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {attendeesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mr-3" />
                  <span className="text-purple-600 font-semibold">Loading attendees...</span>
                </div>
              ) : attendeesModal.list.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">👥</div>
                  <p className="text-gray-500 font-medium">No confirmed registrations yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-purple-50 text-purple-700 sticky top-0">
                    <tr>
                      <th className="text-left px-5 py-3 font-bold">#</th>
                      <th className="text-left px-5 py-3 font-bold">Name</th>
                      <th className="text-left px-5 py-3 font-bold">Roll No</th>
                      <th className="text-left px-5 py-3 font-bold">Branch</th>
                      <th className="text-left px-5 py-3 font-bold">Ticket</th>
                      <th className="text-left px-5 py-3 font-bold">Check-In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendeesModal.list.map((reg, i) => (
                      <tr key={reg._id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-gray-800">{reg.userId?.name || '—'}</div>
                          <div className="text-gray-400 text-xs">{reg.userId?.email || ''}</div>
                        </td>
                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{reg.userId?.rollNumber || '—'}</td>
                        <td className="px-5 py-3 text-gray-600">{reg.userId?.branch || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">{reg.ticketTypeName || 'General'}</span>
                        </td>
                        <td className="px-5 py-3">
                          {reg.checkedInAt ? (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">✅ Yes</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between flex-shrink-0">
              <span className="text-gray-500 text-sm">{attendeesModal.list.length} registered</span>
              <span className="text-green-600 text-sm font-semibold">{attendeesModal.list.filter(r => r.checkedInAt).length} checked in</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
