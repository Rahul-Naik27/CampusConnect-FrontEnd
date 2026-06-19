// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// ── Shared components ──
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";
import ErrorBoundary from "./components/ErrorBoundary";

// ── Pages ──
import Home from "./Pages/Home/Home";
import Auth from "./Pages/Auth/Auth";
import EventDetails from "./Pages/EventDetails/EventDetails";
import Register from "./Pages/Register/Register";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Ticket from "./Pages/Ticket/Ticket";
import AdminPanel from "./Pages/Admin/AdminPanel";
import CheckinScanner from "./Pages/CheckinScanner/CheckinScanner";
import ProfileEdit from "./Pages/ProfileEdit/ProfileEdit";
import NotFound from "./Pages/NotFound/NotFound";
import Feedback from "./Pages/Feedback/Feedback";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/event/:id" element={<EventDetails />} />

            <Route
              path="/register/:id"
              element={<ProtectedRoute><Register /></ProtectedRoute>}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/ticket/:ticketId"
              element={<ProtectedRoute><Ticket /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>}
            />
            <Route
              path="/feedback/:eventId"
              element={<ProtectedRoute><Feedback /></ProtectedRoute>}
            />
            <Route
              path="/checkin-scanner"
              element={<ProtectedRoute adminOnly><CheckinScanner /></ProtectedRoute>}
            />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <ChatBot />
      </div>
    </ErrorBoundary>
  );
}
