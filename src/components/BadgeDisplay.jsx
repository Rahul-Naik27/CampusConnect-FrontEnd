import React from 'react';

const BADGE_DEFS = [
  {
    id: 'first_step',
    emoji: '🌱',
    name: 'First Step',
    desc: 'Register for your first event',
    unlocked: (s) => s.totalRegistrations >= 1,
    color: 'from-green-400 to-emerald-600',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    id: 'enthusiast',
    emoji: '🎭',
    name: 'Event Enthusiast',
    desc: 'Register for 3 or more events',
    unlocked: (s) => s.totalRegistrations >= 3,
    color: 'from-blue-400 to-indigo-600',
    glow: 'rgba(99,102,241,0.4)',
  },
  {
    id: 'legend',
    emoji: '🏆',
    name: 'Campus Legend',
    desc: 'Attend 5 events (checked in)',
    unlocked: (s) => s.attendedCount >= 5,
    color: 'from-yellow-400 to-orange-500',
    glow: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'fest_warrior',
    emoji: '⭐',
    name: 'Fest Warrior',
    desc: 'Register for the biggest campus fest',
    unlocked: (s) => s.attendedBigFest,
    color: 'from-purple-400 to-pink-600',
    glow: 'rgba(168,85,247,0.4)',
  },
  {
    id: 'all_rounder',
    emoji: '🎓',
    name: 'All-Rounder',
    desc: 'Join events from 3+ departments',
    unlocked: (s) => s.departments >= 3,
    color: 'from-rose-400 to-red-600',
    glow: 'rgba(244,63,94,0.4)',
  },
];

export default function BadgeDisplay({ stats, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-14 bg-white/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes badge-glow {
          0%,100% { box-shadow: 0 0 0 0 var(--glow-color); }
          50% { box-shadow: 0 0 18px 4px var(--glow-color); }
        }
        .badge-unlocked { animation: badge-glow 3s ease-in-out infinite; }
      `}</style>
      <div className="space-y-2">
        {BADGE_DEFS.map((badge) => {
          const earned = stats ? badge.unlocked(stats) : false;
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                earned
                  ? 'bg-white/15 border border-white/25 badge-unlocked'
                  : 'bg-white/5 border border-white/10 opacity-50 grayscale'
              }`}
              style={{ '--glow-color': badge.glow }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                {badge.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-bold truncate">{badge.name}</div>
                <div className="text-white/50 text-xs truncate">{badge.desc}</div>
              </div>
              {earned && (
                <div className="flex-shrink-0 text-green-400 text-xs font-bold">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
