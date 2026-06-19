import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#7c3aed', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-purple-100 rounded-xl shadow-xl px-4 py-3">
      {label && <p className="text-xs text-gray-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Timeline Area Chart ──
export function RegistrationsTimeline({ data }) {
  if (!data?.length) return <EmptyChart msg="No registration data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" name="Registrations" stroke="#7c3aed" strokeWidth={3} fill="url(#grad1)" dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Ticket Breakdown Pie Chart ──
export function TicketBreakdownPie({ data }) {
  if (!data?.length) return <EmptyChart msg="No ticket data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" nameKey="type" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Per-Event Bar Chart ──
export function EventCapacityBar({ data }) {
  if (!data?.length) return <EmptyChart msg="No event data yet" />;
  const chartData = data.map(ev => ({
    name: ev.title?.length > 14 ? ev.title.slice(0, 14) + '…' : ev.title,
    Registrations: ev.count,
    Capacity: ev.capacity,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} angle={-20} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="Registrations" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Capacity" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ msg }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 gap-2">
      <span className="text-4xl">📊</span>
      <p className="text-sm font-medium">{msg}</p>
    </div>
  );
}
