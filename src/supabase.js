import { createClient } from '@supabase/supabase-js';

// These are public browser configuration values, not service credentials.
// Row Level Security is responsible for protecting application data.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Configure the public Supabase settings before starting LIETTrack.');
}
export const supabase = createClient(url, key);
