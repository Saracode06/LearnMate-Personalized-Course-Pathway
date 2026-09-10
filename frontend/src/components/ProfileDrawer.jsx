import React, { useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const INTERESTS_LABEL = {
  frontend: 'Frontend Dev', cybersecurity: 'Cybersecurity',
  cloud: 'Cloud Computing', uiux: 'UI/UX Design',
  aiml: 'AI / ML',         data: 'Data Science',
  backend: 'Backend Dev',  devops: 'DevOps & SRE',
};

function XPBar({ xp }) {
  const level = Math.floor(xp / 500) + 1;
  const levelXP = xp % 500;
  const pct = Math.min((levelXP / 500) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-indigo-400">Level {level}</span>
        <span className="text-xs text-slate-500">{levelXP} / 500 XP</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#34d399)', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
      </div>
    </div>
  );
}

export default function ProfileDrawer({ user, preferences, roadmap, quizResults, onClose, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(data => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const completedModules = roadmap?.modules?.filter(m => m.completed) || [];
  const totalModules = roadmap?.modules?.length || 0;
  const pct = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;

  const stats = profile?.stats || {};
  const totalXP = stats.totalXP || 0;
  const avgScore = stats.avgScore;
  const level = Math.floor(totalXP / 500) + 1;

  const avgQuizLocal = quizResults?.length
    ? Math.round((quizResults.reduce((s, r) => s + r.score / r.total, 0) / quizResults.length) * 100)
    : null;

  const displayAvg = avgScore ?? avgQuizLocal;
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 w-80 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(10,10,20,0.98)',
          borderLeft: '1px solid rgba(99,102,241,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.3s ease-out',
        }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Profile</span>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-100 truncate">{user?.name || 'Guest'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'Not signed in'}</p>
              {preferences?.interest && (
                <span className="tag-pill mt-1 inline-block" style={{ fontSize: '10px' }}>
                  {INTERESTS_LABEL[preferences.interest] || preferences.interest}
                </span>
              )}
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <XPBar xp={totalXP} />
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Stats</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Level',    value: level,                      color: '#818cf8' },
              { label: 'XP',       value: totalXP,                    color: '#34d399' },
              { label: 'Avg Quiz', value: displayAvg != null ? `${displayAvg}%` : '—', color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress overview */}
        {roadmap && (
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Roadmap Progress</p>
              <span className="text-xs font-bold gradient-text">{pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-1.5 rounded-full"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#34d399)', transition: 'width 0.6s ease' }} />
            </div>
            <p className="text-xs text-slate-600">{completedModules.length} of {totalModules} modules complete</p>
          </div>
        )}

        {/* Completed modules checklist */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Completed Topics</p>
          {loading && (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl shimmer-bg" />
              ))}
            </div>
          )}
          {!loading && completedModules.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-slate-600 text-sm">No modules completed yet.</p>
              <p className="text-slate-700 text-xs mt-1">Complete a module to see it here.</p>
            </div>
          )}
          {!loading && completedModules.length > 0 && (
            <div className="flex flex-col gap-2">
              {completedModules.map((mod, i) => {
                const qr = quizResults?.filter(r => r.moduleId === mod.id);
                const best = qr?.length ? Math.max(...qr.map(r => Math.round((r.score / r.total) * 100))) : null;
                return (
                  <div key={mod.id} className="p-3 rounded-xl flex items-start gap-3 animate-in"
                    style={{
                      background: 'rgba(52,211,153,0.06)',
                      border: '1px solid rgba(52,211,153,0.15)',
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0,
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)' }}>
                      <span style={{ color: '#34d399', fontSize: '10px' }}>✓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{mod.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="tag-pill" style={{ fontSize: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                          ✓ Done
                        </span>
                        <span className="tag-pill" style={{ fontSize: '10px' }}>{mod.weeks}w</span>
                        {best !== null && (
                          <span className="tag-pill" style={{
                            fontSize: '10px',
                            background: best >= 80 ? 'rgba(52,211,153,0.1)' : best >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${best >= 80 ? 'rgba(52,211,153,0.25)' : best >= 60 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            color: best >= 80 ? '#34d399' : best >= 60 ? '#fbbf24' : '#f87171',
                          }}>
                            📝 {best}%
                          </span>
                        )}
                        <span className="tag-pill" style={{ fontSize: '10px', color: '#4ade80' }}>+100 XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
