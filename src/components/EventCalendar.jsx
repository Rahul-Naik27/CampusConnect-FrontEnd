import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function EventCalendar({ events }) {
  const navigate = useNavigate();
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const daysInPrev = new Date(current.year, current.month, 0).getDate();

  // Group events by date string
  const eventMap = {};
  events.forEach((ev) => {
    const d = new Date(ev.startAt);
    if (d.getFullYear() === current.year && d.getMonth() === current.month) {
      const key = d.getDate();
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(ev);
    }
  });

  const prevMonth = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  const nextMonth = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });

  // Build grid cells
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, type: 'current' });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, type: 'next' });

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold transition-all"
        >
          ‹
        </button>
        <h2 className="text-white font-black text-xl" style={{fontFamily:'Outfit,sans-serif'}}>
          {MONTHS[current.month]} {current.year}
        </h2>
        <button
          onClick={nextMonth}
          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold transition-all"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-purple-50">
        {DAYS.map(d => (
          <div key={d} className="text-center py-3 text-xs font-bold text-purple-600 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-l border-t border-gray-100">
        {cells.map((cell, idx) => {
          const isToday = cell.type === 'current' && cell.day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
          const cellEvents = cell.type === 'current' ? (eventMap[cell.day] || []) : [];
          return (
            <div
              key={idx}
              className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 ${cell.type !== 'current' ? 'bg-gray-50' : 'bg-white hover:bg-purple-50/50'} transition-colors`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                isToday
                  ? 'bg-purple-600 text-white'
                  : cell.type !== 'current'
                  ? 'text-gray-300'
                  : 'text-gray-700'
              }`}>
                {cell.day}
              </div>
              <div className="space-y-0.5">
                {cellEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev._id}
                    onClick={() => navigate(`/event/${ev._id}`)}
                    className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate hover:from-purple-700 hover:to-indigo-700 transition-all"
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {cellEvents.length > 2 && (
                  <div className="text-[10px] text-purple-500 font-bold px-1">
                    +{cellEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600" />
          <span>Events</span>
        </div>
        <div className="ml-auto text-purple-600 font-semibold">
          {events.length} total events
        </div>
      </div>
    </div>
  );
}
