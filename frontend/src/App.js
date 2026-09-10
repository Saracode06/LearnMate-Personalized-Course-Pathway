import React, { useState, useEffect } from 'react';
import OnboardingWizard from './components/OnboardingWizard';
import LoadingRoadmap from './components/LoadingRoadmap';
import RoadmapDashboard from './components/RoadmapDashboard';
import AuthModal from './components/AuthModal';
import { generateRoadmap, getToken, clearToken, getProfile } from './services/api';
import { loadPersistedState, savePersistedState, clearPersistedState, clearRoadmapState } from './utils/storage';

const VIEWS = {
  ONBOARDING: 'onboarding',
  LOADING:    'loading',
  DASHBOARD:  'dashboard',
  ERROR:      'error',
};

export default function App() {
  const persisted = loadPersistedState();

  // Auth state — seed from persisted store so user survives hard refreshes
  const [user, setUser] = useState(persisted?.user || null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // On mount: if a token exists but user object is missing (e.g. token written
  // before the user object was ever persisted) fetch the profile from the API
  // so the navbar shows the avatar immediately without requiring re-login.
  useEffect(() => {
    if (getToken() && !user) {
      getProfile()
        .then(data => {
          const u = data.user ?? data; // handle both { user } and flat shapes
          setUser(u);
          savePersistedState({ ...(loadPersistedState() || {}), user: u });
        })
        .catch(() => {
          // Token is expired / invalid — wipe it so the user is prompted to log in
          clearToken();
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Roadmap state — restore from localStorage if present
  const [view, setView] = useState(
    persisted?.roadmap && persisted?.preferences ? VIEWS.DASHBOARD : VIEWS.ONBOARDING
  );
  const [roadmap, setRoadmap] = useState(persisted?.roadmap || null);
  const [roadmapDbId, setRoadmapDbId] = useState(persisted?.roadmapDbId || null);
  const [preferences, setPreferences] = useState(persisted?.preferences || null);
  const [quizResults, setQuizResults] = useState(persisted?.quizResults || []);
  const [error, setError] = useState('');

  // Gate: show auth modal if user hits "Generate" without being logged in
  const handleOnboardingComplete = async (formData) => {
    if (!getToken()) {
      setPreferences(formData);
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    await doGenerate(formData);
  };

  // Called by navbar Sign In / Sign Up buttons
  const handleShowAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const doGenerate = async (formData) => {
    setPreferences(formData);
    setView(VIEWS.LOADING);
    setError('');
    setShowAuth(false);

    try {
      const data = await generateRoadmap(formData);
      const generatedRoadmap = data.roadmap;
      const dbId = data.roadmapDbId || null;

      setRoadmap(generatedRoadmap);
      setRoadmapDbId(dbId);

      // Read user fresh from storage to avoid stale closure value
      const currentUser = loadPersistedState()?.user || null;
      savePersistedState({
        roadmap: generatedRoadmap,
        roadmapDbId: dbId,
        preferences: formData,
        user: currentUser,
        quizResults: [],
      });
      setQuizResults([]);

      setView(VIEWS.DASHBOARD);
    } catch (err) {
      const msg =
        err.response?.data?.details ||
        err.response?.data?.error  ||
        err.message                 ||
        'Failed to generate roadmap. Please try again.';
      setError(msg);
      setView(VIEWS.ERROR);
    }
  };

  const handleAuth = (token, userData) => {
    setUser(userData);
    // Persist user immediately so navbar stays correct on any subsequent render
    savePersistedState({ ...(loadPersistedState() || {}), user: userData });
    // If auth was triggered mid-onboarding, resume generation; otherwise just close
    if (preferences && view === VIEWS.ONBOARDING) {
      doGenerate(preferences);
    } else {
      setShowAuth(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    clearPersistedState();
    setUser(null);
    setRoadmap(null);
    setRoadmapDbId(null);
    setPreferences(null);
    setQuizResults([]);
    setView(VIEWS.ONBOARDING);
  };

  const handleRestart = () => {
    // Only wipe roadmap data — keep the user object so the navbar stays correct
    clearRoadmapState();
    setRoadmap(null);
    setRoadmapDbId(null);
    setPreferences(null);
    setQuizResults([]);
    setError('');
    setView(VIEWS.ONBOARDING);
  };

  return (
    <div className="noise" style={{ minHeight: '100vh', background: '#0a0a0f' }}>

      {view === VIEWS.ONBOARDING && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onShowAuth={handleShowAuth}
          user={user}
          onLogout={handleLogout}
          quizResults={quizResults}
        />
      )}

      {view === VIEWS.LOADING && (
        <LoadingRoadmap />
      )}

      {view === VIEWS.DASHBOARD && roadmap && (
        <RoadmapDashboard
          roadmap={roadmap}
          roadmapDbId={roadmapDbId}
          preferences={preferences}
          user={user}
          onRestart={handleRestart}
          onLogout={handleLogout}
        />
      )}

      {view === VIEWS.ERROR && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center animate-in"
            style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">Generation Failed</h2>
            <p className="text-slate-400 text-sm mb-2 leading-relaxed">
              LearnMate couldn't generate your roadmap. This may be a temporary issue with the Granite AI API.
            </p>
            <div className="p-3 rounded-lg my-4 text-left"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-red-400 text-xs font-mono break-all">{error}</p>
            </div>
            <button onClick={handleRestart}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white mt-2">
              ← Try Again
            </button>
          </div>
        </div>
      )}

      {/* Auth modal — mandatory, no guest bypass */}
      {showAuth && (
        <AuthModal
          onAuth={handleAuth}
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
        />
      )}
    </div>
  );
}
