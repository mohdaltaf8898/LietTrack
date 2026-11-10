import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Build requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. See .env.example.');
    }
    let url;
    try { url = new URL(env.VITE_SUPABASE_URL); } catch { throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL.'); }
    if (url.protocol !== 'https:') throw new Error('VITE_SUPABASE_URL must use HTTPS for production builds.');
    const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
    let role = '';
    if (key.split('.').length === 3) {
      try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role || ''; } catch { throw new Error('Invalid Supabase JWT key.'); }
    }
    if (key.startsWith('sb_secret_') || role === 'service_role') throw new Error('A server-only Supabase key must never be used in the browser.');
  }
  return { plugins: [react()], server: { host: '0.0.0.0', allowedHosts: true }, preview: { host: '0.0.0.0', allowedHosts: true } };
});
