import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';      // if page is nested two levels deep
import { getUser } from '../../auth';


const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/register/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-semibold">Loading</p>
      </div>
    </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-700">← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {event.posterUrl && (
            <img src={event.posterUrl} alt={event.title} className="w-full h-40 object-cover" />
          )}

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h1>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">📍</span> {event.venue}
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">📅</span> {new Date(event.startAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">⏰</span> {new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">🏢</span> {event.departmentOrClub}
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">👥</span> {event.capacity}
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">🎫</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {event.status}
                  </span>
                </div>
              </div>
            </div>

            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Ticket Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.ticketTypes.map((ticket, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-800 text-sm">{ticket.name}</div>
                      <div className="text-purple-600 font-bold">₹{ticket.price}</div>
                      {ticket.quota && <div className="text-xs text-gray-500">Quota: {ticket.quota}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleRegister}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-semibold text-sm transition transform hover:scale-105"
            >
              Register Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;