import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Token management ──────────────────────────────────────────────────────────
const TOKEN_KEY = 'learnmate_token';

export function getToken()          { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t)         { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken()        { localStorage.removeItem(TOKEN_KEY); }

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function registerUser(name, email, password) {
  const r = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
  if (r.data.token) setToken(r.data.token);
  return r.data;
}

export async function loginUser(email, password) {
  const r = await axios.post(`${API_BASE}/auth/login`, { email, password });
  if (r.data.token) setToken(r.data.token);
  return r.data;
}

export async function getProfile() {
  const r = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders() });
  return r.data;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export async function generateRoadmap(formData) {
  const r = await axios.post(`${API_BASE}/roadmap/generate`, formData, { headers: authHeaders() });
  return r.data; // { roadmap, roadmapDbId }
}

export async function adaptRoadmap(originalRoadmap, completedModuleIds, newPreferences, roadmapDbId) {
  const r = await axios.post(`${API_BASE}/roadmap/adapt`,
    { originalRoadmap, completedModuleIds, newPreferences, roadmapDbId },
    { headers: authHeaders() }
  );
  return r.data.roadmap;
}

export async function saveProgress(roadmapDbId, moduleId, completed) {
  if (!roadmapDbId) return; // guest mode — skip
  await axios.post(`${API_BASE}/roadmap/progress`,
    { roadmapDbId, moduleId, completed },
    { headers: authHeaders() }
  ).catch(() => {}); // non-fatal
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export async function generateQuiz(topic, moduleTitle, difficulty) {
  const r = await axios.post(`${API_BASE}/quiz`,
    { topic, moduleTitle, difficulty },
    { headers: authHeaders() }
  );
  return r.data.quiz;
}

export async function submitQuizResult({ topic, score, total, moduleId, roadmapDbId, moduleTitle, difficulty }) {
  const r = await axios.post(`${API_BASE}/quiz/result`,
    { topic, score, total, moduleId, roadmapDbId, moduleTitle, difficulty },
    { headers: authHeaders() }
  );
  return r.data; // { passed, remediation }
}

// ── Study Assistant ───────────────────────────────────────────────────────────
export async function askAssistant(question, context) {
  const r = await axios.post(`${API_BASE}/ask`,
    { question, context },
    { headers: authHeaders() }
  );
  return r.data.answer;
}

export async function checkHealth() {
  const r = await axios.get(`${API_BASE}/health`);
  return r.data;
}
