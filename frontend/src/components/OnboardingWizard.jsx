import React, { useState } from 'react';
import ProfileDrawer from './ProfileDrawer';

const INTERESTS = [
  { id: 'frontend', label: 'Frontend Development', icon: '⚡', desc: 'React, Vue, HTML/CSS, JS' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🛡️', desc: 'Ethical hacking, Security ops' },
  { id: 'cloud', label: 'Cloud Computing', icon: '☁️', desc: 'AWS, Azure, IBM Cloud, DevOps' },
  { id: 'uiux', label: 'UI/UX Design', icon: '🎨', desc: 'Figma, Design systems, UX research' },
  { id: 'aiml', label: 'AI / Machine Learning', icon: '🤖', desc: 'Python, Deep learning, LLMs' },
  { id: 'data', label: 'Data Science', icon: '📊', desc: 'SQL, Analytics, Visualization' },
  { id: 'backend', label: 'Backend Development', icon: '🔧', desc: 'Node.js, APIs, Databases' },
  { id: 'devops', label: 'DevOps & SRE', icon: '🚀', desc: 'CI/CD, Docker, Kubernetes' },
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to the field, learning fundamentals', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience, building real projects', icon: '🔥' },
  { id: 'advanced', label: 'Advanced', desc: 'Solid background, ready for specialization', icon: '💎' },
];

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual Learner', desc: 'Videos, diagrams, demos', icon: '👁️' },
  { id: 'hands-on', label: 'Hands-On', desc: 'Projects, labs, practice', icon: '🛠️' },
  { id: 'reading', label: 'Reading/Writing', desc: 'Docs, articles, notes', icon: '📖' },
  { id: 'mixed', label: 'Mixed Approach', desc: 'Combination of all styles', icon: '⚡' },
];

const WEEKLY_HOURS = [
  { id: '3', label: '1–3 hrs/week', desc: 'Casual pace' },
  { id: '7', label: '4–7 hrs/week', desc: 'Steady progress' },
  { id: '15', label: '8–15 hrs/week', desc: 'Focused learning' },
  { id: '25', label: '15+ hrs/week', desc: 'Intensive bootcamp' },
];

const STEPS = [
  { number: 1, title: 'Career Interest' },
  { number: 2, title: 'Skill Level' },
  { number: 3, title: 'Learning Preferences' },
];

export default function OnboardingWizard({ onComplete, onShowAuth, user, onLogout, quizResults = [] }) {
  const [showProfile, setShowProfile] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interest: '',
    skillLevel: '',
    learningStyle: '',
    weeklyHours: '',
  });

  const canProceed = () => {
    if (step === 1) return !!formData.interest;
    if (step === 2) return !!formData.skillLevel;
    if (step === 3) return !!formData.learningStyle && !!formData.weeklyHours;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else onComplete(formData);
  };

  const progressPct = ((step - 1) / 3) * 100 + (canProceed() ? 33.3 : 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">

      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-base font-black gradient-text tracking-tight select-none">LearnMate</span>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-slate-400 text-sm hidden sm:inline">
                {user.name || user.email}
              </span>
              <button
                onClick={() => setShowProfile(true)}
                title="Your profile"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)', boxShadow: '0 0 15px rgba(99,102,241,0.35)' }}>
                {user.name
                  ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  : '👤'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onShowAuth('login')}
                className="btn-secondary px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-300">
                Sign In
              </button>
              <button
                onClick={() => onShowAuth('register')}
                className="btn-primary px-4 py-1.5 rounded-xl text-sm font-semibold text-white">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Profile Drawer — same component used on the dashboard */}
      {showProfile && (
        <ProfileDrawer
          user={user}
          preferences={null}
          roadmap={null}
          quizResults={quizResults}
          onClose={() => setShowProfile(false)}
          onLogout={() => { setShowProfile(false); onLogout(); }}
        />
      )}

      {/* Background orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 animate-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Powered by Granite 3.0 AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ lineHeight: 1.1 }}>
            <span className="gradient-text">LearnMate</span>
          </h1>
          <p className="text-slate-400 text-lg font-light">Your AI career coach — let's build your personalized pathway</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > s.number
                    ? 'bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg'
                    : step === s.number
                    ? 'bg-indigo-600 text-white glow-purple'
                    : 'text-slate-500'
                }`}
                  style={step <= s.number && step !== s.number ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                  {step > s.number ? '✓' : s.number}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${step === s.number ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-20 h-px mb-5 mx-1" style={{
                  background: step > s.number
                    ? 'linear-gradient(90deg, #6366f1, #34d399)'
                    : 'rgba(255,255,255,0.08)'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-8" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="progress-bar h-1" style={{ width: `${Math.min(progressPct, 100)}%` }} />
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 animate-in" key={step}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-2">What's your career goal?</h2>
              <p className="text-slate-400 mb-6 text-sm">Choose the field you want to master. LearnMate will build a roadmap tailored for you.</p>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData(f => ({ ...f, interest: item.id }))}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      formData.interest === item.id
                        ? 'border-indigo-500 glow-purple'
                        : 'border-transparent hover:border-indigo-500/30'
                    }`}
                    style={{
                      background: formData.interest === item.id
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-semibold text-sm text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-2">What's your current skill level?</h2>
              <p className="text-slate-400 mb-6 text-sm">Be honest — LearnMate will calibrate module difficulty accordingly.</p>
              <div className="flex flex-col gap-4">
                {SKILL_LEVELS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData(f => ({ ...f, skillLevel: item.id }))}
                    className={`p-5 rounded-xl text-left flex items-center gap-5 transition-all duration-200 border ${
                      formData.skillLevel === item.id
                        ? 'border-indigo-500 glow-purple'
                        : 'border-transparent hover:border-indigo-500/30'
                    }`}
                    style={{
                      background: formData.skillLevel === item.id
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-100">{item.label}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    {formData.skillLevel === item.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-2">How do you learn best?</h2>
              <p className="text-slate-400 mb-5 text-sm">This helps LearnMate recommend the right course formats and pacing.</p>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Learning Style</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {LEARNING_STYLES.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData(f => ({ ...f, learningStyle: item.id }))}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      formData.learningStyle === item.id
                        ? 'border-indigo-500 glow-purple'
                        : 'border-transparent hover:border-indigo-500/30'
                    }`}
                    style={{
                      background: formData.learningStyle === item.id
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="font-semibold text-sm text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Weekly Time Commitment</p>
              <div className="grid grid-cols-2 gap-3">
                {WEEKLY_HOURS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFormData(f => ({ ...f, weeklyHours: item.id }))}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      formData.weeklyHours === item.id
                        ? 'border-emerald-500 glow-green'
                        : 'border-transparent hover:border-emerald-500/30'
                    }`}
                    style={{
                      background: formData.weeklyHours === item.id
                        ? 'rgba(52,211,153,0.1)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="font-semibold text-sm text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="btn-secondary px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {step === 3 ? '✨ Generate My Roadmap' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
