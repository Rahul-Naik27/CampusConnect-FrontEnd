import React, { useEffect, useState } from 'react';
import api from '../../api';

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
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
    if (errMsg) {
      setMessage({ type: 'error', text: errMsg });
      return;
    }

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
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
      console.error(err);
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/admin/events/${id}`);
      setMessage({ type: 'success', text: 'Event deleted successfully!' });
      await fetchEvents();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete event' });
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
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
    setShowForm(false);
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...(prev.ticketTypes || []), { name: '', price: 0, quota: 0 }]
    }));
  };

  const updateTicketType = (index, field, value) => {
    setFormData(prev => {
      const updated = (prev.ticketTypes || []).map((t, i) => ({ ...t }));
      updated[index] = { ...updated[index] };
      updated[index][field] = field === 'name' ? String(value) : Number(value);
      return { ...prev, ticketTypes: updated };
    });
  };

  const removeTicketType = (index) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: (prev.ticketTypes || []).filter((_, i) => i !== index)
    }));
  };

  const toggleForm = () => {
    if (!showForm) {
      resetForm();
      setShowForm(true);
    } else {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={toggleForm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
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
      placeholder="Name (e.g., General, VIP and Premium)"
      value={ticket.name}
      onChange={(e) => updateTicketType(index, 'name', e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
      <input
        type="number"
        placeholder="Price"
        value={ticket.price}
        onChange={(e) => updateTicketType(index, 'price', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
        min={0}
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">Seats Available</label>
      <input
        type="number"
        placeholder="Quota"
        value={ticket.quota}
        onChange={(e) => updateTicketType(index, 'quota', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
        min={0}
      />
    </div>
  </div>

  <button
    type="button"
    onClick={() => removeTicketType(index)}
    className="self-end text-red-600 hover:text-red-700 font-bold px-3 py-1"
  >
    ✕ Remove
  </button>
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

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
