import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';      // if page is nested two levels deep
import { getUser } from '../../auth';


const Register = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      if (data.ticketTypes && data.ticketTypes.length > 0) {
        setSelectedTicketType(data.ticketTypes[0].name);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load event' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const user = getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await api.post('/registrations', {
        eventId: id,
        ticketTypeName: selectedTicketType || 'General'
      });
      setMessage({ type: 'success', text: 'Registration successful!' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Register for Event</h1>

          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
            <p className="text-gray-600">{event.description}</p>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div>📍 {event.venue}</div>
              <div>📅 {new Date(event.startAt).toLocaleString()}</div>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Ticket Type</label>
                <select
                  value={selectedTicketType}
                  onChange={(e) => setSelectedTicketType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {event.ticketTypes.map((ticket, idx) => (
                    <option key={idx} value={ticket.name}>
                      {ticket.name} - ₹{ticket.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
