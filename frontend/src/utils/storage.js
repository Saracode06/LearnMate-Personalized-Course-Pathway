import { useState, useEffect } from 'react';

const STORAGE_KEY = 'learnmate_state';
export const USER_SUBKEY = 'user';

/**
 * Reads the full persisted state from localStorage.
 */
export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Writes the full persisted state to localStorage.
 */
export function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

/**
 * Clears all LearnMate persisted state.
 */
export function clearPersistedState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Clears only roadmap-related keys, preserving the user object.
 * Use on "New Roadmap" / restart so the navbar stays authenticated.
 */
export function clearRoadmapState() {
  const full = loadPersistedState();
  if (!full) return;
  const { user } = full; // preserve only the user
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user ? { user } : {}));
  } catch {
    // storage unavailable — silently ignore
  }
}

/**
 * React hook: persists a value to localStorage under a sub-key.
 * @param {string} key   - Sub-key within STORAGE_KEY namespace
 * @param {*}     init   - Initial value if nothing is persisted
 */
export function usePersistedState(key, init) {
  const [value, setValue] = useState(() => {
    const full = loadPersistedState();
    return full && full[key] !== undefined ? full[key] : init;
  });

  useEffect(() => {
    const full = loadPersistedState() || {};
    savePersistedState({ ...full, [key]: value });
  }, [key, value]);

  return [value, setValue];
}
