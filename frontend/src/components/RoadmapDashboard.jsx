import React, { useState } from 'react';
import { adaptRoadmap, generateQuiz, saveProgress } from '../services/api';
import QuizModal from './QuizModal';
import ProfileDrawer from './ProfileDrawer';
import { exportPDF } from '../utils/exportRoadmap';
import { usePersistedState } from '../utils/storage';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
  Intermediate: { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Advanced:     { bg: 'rgba(239,68,68,0.1)',     border: 'rgba(239,68,68,0.3)',   text: '#f87171' },
};

const INTERESTS_LABEL = {
  frontend: 'Frontend Development', cybersecurity: 'Cybersecurity',
  cloud: 'Cloud Computing',         uiux: 'UI/UX Design',
  aiml: 'AI / Machine Learning',    data: 'Data Science',
  backend: 'Backend Development',   devops: 'DevOps & SRE',
};

// ── Module Card ────────────────────────────────────────────────────────────────
function ModuleCard({ module, index, onToggle, total, onStartQuiz, quizResults }) {
  const [expanded, setExpanded] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const diff = DIFFICULTY_COLORS[module.difficulty] || DIFFICULTY_COLORS.Beginner;
  const moduleQuizResults = quizResults.filter(r => r.moduleId === module.id);
  const bestScore = moduleQuizResults.length
    ? Math.max(...moduleQuizResults.map(r => Math.round((r.score / r.total) * 100)))
    : null;

  const handleQuiz = async (e) => {
    e.stopPropagation();
    setQuizLoading(true); setQuizError('');
    try {
      const topic = module.topics?.join(', ') || module.title;
      const quiz = await generateQuiz(topic, module.title, module.difficulty);
      onStartQuiz(module, quiz);
    } catch {
      setQuizError('Failed to generate quiz. Try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="relative flex gap-5">
      {index < total - 1 && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 -ml-px"
          style={{ background: module.completed ? 'linear-gradient(180deg,#34d399,#6366f1)' : 'rgba(255,255,255,0.06)' }} />
      )}

      <div className="flex-shrink-0 relative z-10">
        <button onClick={() => onToggle(module.id)}
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
          style={{
            background: module.completed ? 'linear-gradient(135deg,#059669,#34d399)' : 'linear-gradient(135deg,#4338ca,#6366f1)',
            boxShadow: module.completed ? '0 0 20px rgba(52,211,153,0.4)' : '0 0 20px rgba(99,102,241,0.3)',
          }}
          title="Toggle completion">
          {module.completed ? '✓' : index + 1}
        </button>
      </div>

      <div className={`flex-1 mb-6 glass-card rounded-xl overflow-hidden transition-all duration-300 ${module.completed ? 'opacity-75' : ''}`}
        style={{ border: module.completed ? '1px solid rgba(52,211,153,0.2)' : undefined }}>

        <div className="p-5 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="tag-pill" style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text }}>
                  {module.difficulty}
                </span>
                <span className="tag-pill">{module.weeks} {module.weeks === 1 ? 'week' : 'weeks'}</span>
                {module.completed && (
                  <span className="tag-pill" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                    ✓ Completed
                  </span>
                )}
                {bestScore !== null && (
                  <span className="tag-pill" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    🏆 Best: {bestScore}%
                  </span>
                )}
              </div>
              <h3 className={`text-lg font-bold ${module.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                {module.title}
              </h3>
              <p className="text-slate-400 text-sm mt-1">{module.description}</p>
            </div>
            <span className="text-slate-500 text-lg flex-shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 border-t border-white/5">
            {module.topics?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Topics Covered</p>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((t, i) => <span key={i} className="tag-pill">{t}</span>)}
                </div>
              </div>
            )}
            {module.ibmCourse && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Industry-Standard Curriculum</span>
                  <span className="tag-pill" style={{ fontSize: '10px' }}>{module.ibmCourse.duration}</span>
                </div>
                <a href={module.ibmCourse.url || 'https://skillsbuild.org'} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-slate-200 hover:text-indigo-300 transition-colors">
                  {module.ibmCourse.name} ↗
                </a>
              </div>
            )}
            {module.milestoneProject && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">🏆 Milestone Project</p>
                <p className="text-sm text-slate-300">{module.milestoneProject}</p>
              </div>
            )}
            {quizError && <p className="mt-3 text-xs text-red-400 text-center">{quizError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => onToggle(module.id)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: module.completed ? 'rgba(52,211,153,0.1)' : 'rgba(99,102,241,0.12)',
                  border: module.completed ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(99,102,241,0.2)',
                  color: module.completed ? '#34d399' : '#a5b4fc',
                }}>
                {module.completed ? '↩ Mark Incomplete' : '✓ Mark Complete'}
              </button>
              <button onClick={handleQuiz} disabled={quizLoading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                {quizLoading ? (
                  <><span className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin inline-block" /> Generating…</>
                ) : <>📝 Take 10-Q Quiz</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Adapt Modal ────────────────────────────────────────────────────────────────
function AdaptModal({ roadmap, completedIds, preferences, roadmapDbId, onAdapt, onClose }) {
  const [newPrefs, setNewPrefs] = useState({ ...preferences });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdapt = async () => {
    setLoading(true); setError('');
    try {
      const adapted = await adaptRoadmap(roadmap, completedIds, newPrefs, roadmapDbId);
      onAdapt(adapted); onClose();
    } catch (e) {
      setError(e.response?.data?.details || e.message || 'Failed to adapt roadmap');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md glass-card rounded-2xl p-7 animate-in"
        style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
        <h3 className="text-xl font-bold mb-1 gradient-text">Adapt Your Roadmap</h3>
        <p className="text-slate-400 text-sm mb-6">LearnMate re-routes remaining modules while preserving your progress.</p>
        <div className="flex flex-col gap-4">
          {[
            { label: 'Weekly Hours', key: 'weeklyHours', options: [['3','1–3 hrs/week'],['7','4–7 hrs/week'],['15','8–15 hrs/week'],['25','15+ hrs/week']] },
            { label: 'Learning Style', key: 'learningStyle', options: [['visual','Visual Learner'],['hands-on','Hands-On'],['reading','Reading/Writing'],['mixed','Mixed']] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
              <select value={newPrefs[key] || ''} onChange={e => setNewPrefs(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Additional Focus</label>
            <input type="text" value={newPrefs.additionalFocus || ''}
              onChange={e => setNewPrefs(p => ({ ...p, additionalFocus: e.target.value }))}
              placeholder="e.g. certifications, cloud, projects…"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={loading}
            className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300">Cancel</button>
          <button onClick={handleAdapt} disabled={loading}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold text-white">
            {loading ? <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Adapting…
            </span> : '⚡ Adapt Roadmap'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export Button — direct PDF download, no dropdown ──────────────────────────
function ExportButton({ roadmap, preferences, userName }) {
  const [loading, setLoading] = useState(false);

  const handlePDF = async () => {
    setLoading(true);
    try { await exportPDF(roadmap, preferences, userName); }
    finally { setLoading(false); }
  };

  return (
    <button onClick={handlePDF} disabled={loading}
      className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium text-slate-300 flex items-center gap-1.5 disabled:opacity-50">
      {loading
        ? <span className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-300 rounded-full animate-spin inline-block" />
        : '↓'}
      Export Roadmap
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function RoadmapDashboard({ roadmap: initialRoadmap, roadmapDbId, preferences, user, onRestart, onLogout }) {
  const [roadmap, setRoadmap] = usePersistedState('roadmap', initialRoadmap);
  const [quizResults, setQuizResults] = usePersistedState('quizResults', []);
  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const completedIds = roadmap.modules.filter(m => m.completed).map(m => m.id);
  const completedCount = completedIds.length;
  const totalCount = roadmap.modules.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalWeeksLeft = roadmap.modules.filter(m => !m.completed).reduce((s, m) => s + (m.weeks || 0), 0);
  const totalXP = completedCount * 100;
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleToggle = (id) => {
    const module = roadmap.modules.find(m => m.id === id);
    const nowCompleted = !module?.completed;
    const updated = { ...roadmap, modules: roadmap.modules.map(m => m.id === id ? { ...m, completed: nowCompleted } : m) };
    setRoadmap(updated);
    saveProgress(roadmapDbId, id, nowCompleted);
  };

  const handleSaveQuizResult = ({ topic, score, total, moduleId, date }) => {
    setQuizResults(prev => [...prev, { moduleId, topic, score, total, date }]);
  };

  return (
    <div className="min-h-screen px-4 py-12 relative">
      <div className="fixed top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="fixed bottom-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-3xl mx-auto">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-10 animate-in flex-wrap gap-3">
          <button onClick={onRestart}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium text-slate-400">
            ← New Roadmap
          </button>

          <div className="flex items-center gap-3">
            <ExportButton roadmap={roadmap} preferences={preferences} userName={user?.name} />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse inline-block" />
              Granite 3.0 AI
            </div>

            {/* Profile avatar */}
            <button onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)', boxShadow: '0 0 15px rgba(99,102,241,0.35)' }}
              title="Your profile">
              {user ? initials : '👤'}
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="glass-card rounded-2xl p-7 mb-6 animate-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <span className="tag-pill mb-3 inline-block"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                {INTERESTS_LABEL[preferences?.interest] || preferences?.interest}
                &nbsp;·&nbsp;
                {preferences?.skillLevel && preferences.skillLevel.charAt(0).toUpperCase() + preferences.skillLevel.slice(1)}
              </span>
              <h1 className="text-2xl md:text-3xl font-black mb-2 text-slate-100 leading-tight">{roadmap.title}</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{roadmap.summary}</p>
              {roadmap.careerOutcome && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-emerald-400 text-xs">🎯 Career Outcome:</span>
                  <span className="text-slate-300 text-xs font-medium">{roadmap.careerOutcome}</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowAdaptModal(true)}
              className="btn-primary flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
              ⚡ Adapt Roadmap
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Modules',   value: `${completedCount}/${totalCount}`, sub: 'done'      },
            { label: 'Progress',  value: `${progressPct}%`,                 sub: 'overall'   },
            { label: 'XP',        value: totalXP,                           sub: 'earned'    },
            { label: 'Wks Left',  value: totalWeeksLeft,                    sub: 'estimated' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-3 text-center animate-in"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
              <div className="text-xl font-black gradient-text">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass-card rounded-xl p-5 mb-8 animate-in delay-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Overall Progress</span>
            <span className="text-sm font-bold gradient-text">{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="progress-bar h-2" style={{ width: `${progressPct}%` }} />
          </div>
          {progressPct === 100 && (
            <div className="mt-4 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-emerald-400 font-semibold text-sm mt-1">Congratulations! You've completed your roadmap!</p>
            </div>
          )}
        </div>

        {/* Quiz history */}
        {quizResults.length > 0 && (
          <div className="glass-card rounded-xl p-5 mb-8 animate-in delay-400">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">📝 Recent Quiz Scores</p>
            <div className="flex flex-col gap-2">
              {quizResults.slice(-5).reverse().map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 truncate max-w-xs">{r.topic}</span>
                  <span className="font-bold ml-4 flex-shrink-0"
                    style={{ color: r.score/r.total >= 0.7 ? '#34d399' : r.score/r.total >= 0.5 ? '#fbbf24' : '#f87171' }}>
                    {r.score}/{r.total} ({Math.round((r.score/r.total)*100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules */}
        <div className="animate-in delay-400">
          <h2 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
            <span>📍</span> Learning Modules
            <span className="text-slate-600 text-sm font-normal ml-1">— click node to toggle · expand for quiz</span>
          </h2>
          <div className="pl-3">
            {roadmap.modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                total={roadmap.modules.length}
                onToggle={handleToggle}
                onStartQuiz={(mod, quiz) => setActiveQuiz({ module: mod, quiz })}
                quizResults={quizResults}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12 text-slate-700 text-xs animate-in delay-500">
          Generated by Granite AI Engine · {roadmap.totalWeeks} week curriculum · LearnMate AI
        </div>
      </div>

      {/* Modals */}
      {showAdaptModal && (
        <AdaptModal
          roadmap={roadmap}
          completedIds={completedIds}
          preferences={preferences}
          roadmapDbId={roadmapDbId}
          onAdapt={r => setRoadmap(r)}
          onClose={() => setShowAdaptModal(false)}
        />
      )}

      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz.quiz}
          moduleTitle={activeQuiz.module.title}
          moduleId={activeQuiz.module.id}
          roadmapDbId={roadmapDbId}
          difficulty={activeQuiz.module.difficulty}
          onClose={() => setActiveQuiz(null)}
          onSaveResult={handleSaveQuizResult}
        />
      )}

      {/* Profile Drawer */}
      {showProfile && (
        <ProfileDrawer
          user={user}
          preferences={preferences}
          roadmap={roadmap}
          quizResults={quizResults}
          onClose={() => setShowProfile(false)}
          onLogout={() => { setShowProfile(false); onLogout(); }}
        />
      )}
    </div>
  );
}
