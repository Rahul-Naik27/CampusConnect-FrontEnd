import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndRegistrations();
  }, []);

  const fetchUserAndRegistrations = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      const { data } = await api.get('/registrations/me');
      setRegistrations(data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (registration) => {
    try {
      const { data } = await api.post('/tickets/issue', {
        registrationId: registration._id
      });
      navigate(`/ticket/${data.ticket.ticketId}`);
    } catch (err) {
      console.error('Failed to issue ticket:', err);
      alert(err.response?.data?.message || 'Failed to issue ticket');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg p-8 overflow-y-auto">
          <div className="text-center mb-8">
            {/* User Avatar */}
            <img
              src={user?.avatar || "/boy.png"}
              alt="User Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-purple-600"
            />
            <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-2">{user?.name || 'User'}</h2>
            <p className="text-gray-600 font-semibold">{user?.email || 'email@example.com'}</p>
            {user?.role && (
              <p className="text-purple-600 font-semibold text-sm mt-2 capitalize">{user.role}</p>
            )}
          </div>

          <hr className="my-6" />

          {/* User Info */}
          <div className="space-y-4 mb-8">
            {user?.rollNumber && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Roll Number</p>
                <p className="font-semibold text-gray-800">{user.rollNumber}</p>
              </div>
            )}
            {user?.collegeUID && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">College UID</p>
                <p className="font-semibold text-gray-800">{user.collegeUID}</p>
              </div>
            )}
            {user?.branch && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Branch</p>
                <p className="font-semibold text-gray-800">{user.branch}</p>
              </div>
            )}
            {user?.yearOfStudy && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Year of Study</p>
                <p className="font-semibold text-gray-800">{user.yearOfStudy}</p>
              </div>
            )}
            {user?.gender && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Gender</p>
                <p className="font-semibold text-gray-800 capitalize">{user.gender}</p>
              </div>
            )}
            {user?.class && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Class</p>
                <p className="font-semibold text-gray-800">{user.class}</p>
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/profile`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate(`http://localhost:5173/event/690fa2afba957a74c7ac8cc4`)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              Browse Events
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/auth');
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Registrations</h1>

          {registrations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg mb-6">No registrations yet</p>
              <button
                onClick={() => navigate('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map(reg => (
                <div key={reg._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{reg.eventId?.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{reg.eventId?.description}</p>

                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div>🎫 {reg.ticketTypeName}</div>
                    <div>📅 {new Date(reg.eventId?.startAt).toLocaleDateString()}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewTicket(reg)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    View Ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;