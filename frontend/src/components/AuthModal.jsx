import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ onAuth, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await loginUser(form.email, form.password)
        : await registerUser(form.name, form.email, form.password);
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600 transition-all duration-200 focus:border-indigo-500';
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden animate-in"
        style={{ border: '1px solid rgba(99,102,241,0.25)' }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            🎓
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login'
              ? 'Sign in to access your personalized roadmap'
              : 'Start your AI-powered learning journey today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} required
                placeholder="Alex Johnson" className={inputCls} style={inputStyle} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} required
              placeholder="you@email.com" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set('password')} required
              placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'} className={inputCls} style={inputStyle} />
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white mt-1 disabled:opacity-40">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              mode === 'login' ? '→ Sign In' : '✨ Create Account'
            )}
          </button>

          {/* Toggle */}
          <p className="text-center text-slate-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
