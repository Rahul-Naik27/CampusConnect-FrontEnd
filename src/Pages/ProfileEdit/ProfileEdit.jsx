import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    rollNumber: '',
    gender: 'male',
    class: '',
    branch: '',
    yearOfStudy: '1st',
    collegeUID: '',
    avatar: '/boy.png'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        rollNumber: userData.rollNumber || '',
        gender: userData.gender || 'male',
        class: userData.class || '',
        branch: userData.branch || '',
        yearOfStudy: userData.yearOfStudy || '1st',
        collegeUID: userData.collegeUID || '',
        avatar: userData.gender === 'female' ? '/girl.png' : '/boy.png'
      }));
    }
  }, []);

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
      avatar: gender === 'female' ? '/girl.png' : '/boy.png'
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await api.put('/users/profile', formData);
    // backend returns { message, user }
    const updatedUser = data.user || data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('Profile updated successfully!');
    navigate('/dashboard');
  } catch (err) {
    console.error('Failed to update profile:', err);
    alert(err.response?.data?.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8">
            <h1 className="text-4xl font-black text-white mb-2">Edit Profile</h1>
            <p className="text-purple-100">Update your personal information</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <img
                    src={formData.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-600 shadow-lg"
                  />
                  <p className="text-sm text-gray-600"> </p>
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Gender</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition transform hover:scale-105 ${
                      formData.gender === 'male'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition transform hover:scale-105 ${
                      formData.gender === 'female'
                        ? 'bg-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👩 Female
                  </button>
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-bold text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              {/* College UID */}
              <div>
                <label htmlFor="collegeUID" className="block text-sm font-bold text-gray-700 mb-2">
                  College UID (Student ID)
                </label>
                <input
                  type="text"
                  id="collegeUID"
                  name="collegeUID"
                  value={formData.collegeUID}
                  onChange={handleInputChange}
                  placeholder="e.g., UID123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Class */}
              <div>
                <label htmlFor="class" className="block text-sm font-bold text-gray-700 mb-2">
                  Class
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  placeholder="e.g., B.Tech CSE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Branch */}
              <div>
                <label htmlFor="branch" className="block text-sm font-bold text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="ECE">Electronics and Communication</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="IT">Information Technology</option>
                </select>
              </div>

              {/* Year of Study */}
              <div>
                <label htmlFor="yearOfStudy" className="block text-sm font-bold text-gray-700 mb-2">
                  Year of Study
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-bold transition transform hover:scale-105 disabled:opacity-50" 
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;