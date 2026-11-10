import { useCallback, useEffect, useState } from 'react';

// Demo-only browser storage, separate from the transport assignment. No server sync.
const EVENT = 'liettrack:demo-storage';
export function useDemoStorage(key, fallback, valid = () => true) {
  const read = useCallback(() => {
    try { const raw = localStorage.getItem(key); if (raw === null) return fallback; const value = JSON.parse(raw); return valid(value) ? value : fallback; } catch { return fallback; }
  }, [key]);
  const [value, setValue] = useState(read);
  const [error, setError] = useState('');
  useEffect(() => { const sync = event => { if (event.type === 'storage' && event.key !== key && event.key !== null) return; if (event.type === EVENT && event.detail !== key) return; setValue(read()); }; window.addEventListener('storage',sync); window.addEventListener(EVENT,sync); return () => { window.removeEventListener('storage',sync); window.removeEventListener(EVENT,sync); }; }, [key,read]);
  const save = useCallback(next => { try { localStorage.setItem(key, JSON.stringify(next)); setValue(next); setError(''); window.dispatchEvent(new CustomEvent(EVENT, {detail:key})); return true; } catch { setError('Could not save in this browser. Check your storage settings and try again.'); return false; } }, [key]);
  return [value, save, error];
}
export const PROFILE_KEY = 'liettrack.demo.profile.v1';
export const PREFERENCE_KEY = 'liettrack.demo.preferences.v1';
export const SAVED_ROUTES_KEY = 'liettrack.demo.saved-routes.v1';
export const emptyProfile = { name:'', studentId:'', department:'', year:'', section:'', email:'' };
export const emptyPreferences = { preferredStop:'' };
export const validObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const validRoutes = v => Array.isArray(v) && v.every(id => typeof id === 'string');
export const validProfile = v => validObject(v) && Object.keys(emptyProfile).every(key => v[key] === undefined || typeof v[key] === 'string');
export const validPreferences = v => validObject(v) && (v.preferredStop === undefined || typeof v.preferredStop === 'string');
