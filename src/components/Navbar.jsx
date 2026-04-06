import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../auth';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    // remove Authorization header if using global axios instance
    localStorage.removeItem('token');
    navigate('/auth');
    window.location.reload(); // ensure header cleared in-memory
  };

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-purple-900 to-indigo-950 text-white shadow-2xl sticky top-0 z-50 border-b border-purple-500/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">🎓 CampusConnect</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
  
  {/* Always show Home */}
  <Link to="/" className="hover:bg-white/20 px-3 py-2 rounded-lg transition">
    Home
  </Link>

  {user ? (
    <>
      {/* USER MENU */}
      {JSON.parse(localStorage.getItem("user")).role === "user" && (
        <>
          <Link
            to="/dashboard"
            className="hover:bg-white/20 px-3 py-2 rounded-lg transition"
          >
            Dashboard
          </Link>
        </>
      )}

      {/* ADMIN MENU */}
      {JSON.parse(localStorage.getItem("user")).role === "admin" && (
        <>
          <Link
            to="/admin"
            className="hover:bg-white/20 px-3 py-2 rounded-lg transition"
          >
            Admin
          </Link>
          <Link
            to="/checkin-scanner"
            className="hover:bg-white/20 px-3 py-2 rounded-lg transition"
          >
            Scanner
          </Link>
        </>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
      >
        Logout
      </button>
    </>
    ) : (
      <Link
        to="/auth"
        className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition"
      >
        Get Started
      </Link>
    )}
</div>


          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-purple-700 px-2 pt-2 pb-3 space-y-1">
          <Link to="/" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg">Dashboard</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg">Admin</Link>
                  <Link to="/checkin-scanner" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg">Scanner</Link>
                </>
              )}
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg">Logout</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)} className="block bg-white text-purple-600 px-3 py-2 rounded-lg font-semibold">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
