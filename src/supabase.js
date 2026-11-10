import { createClient } from '@supabase/supabase-js';
// Publishable key is intended for browser use. Database RLS enforces access.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://pzcoyqzurslxnxlzzsue.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_PFJvkq1se4mSxIbajbIcZQ_hcZTZ0sL';
export const supabase = createClient(url, key);
