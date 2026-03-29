/**
 * Supabase Client — Issue 10: Auth + Cloud Sync
 * Saves analysis history across sessions.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be set in the environment.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface AnalysisHistoryEntry {
  id?: string;
  user_id: string;
  job_title: string | null;
  overall_score: number;
  created_at?: string;
  analysis_json: string; // stringified AnalysisResult
}

/**
 * Sign in with Google OAuth via Supabase.
 */
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Save an analysis result to the user's cloud history.
 */
export async function saveAnalysisToCloud(entry: AnalysisHistoryEntry): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('analysis_history').insert(entry);
  if (error) throw error;
}

/**
 * Load all analysis history entries for the current user.
 */
export async function loadAnalysisHistory(userId: string): Promise<AnalysisHistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as AnalysisHistoryEntry[];
}
