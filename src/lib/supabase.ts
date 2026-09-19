import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Problem, Milestone, Proposal, IndustryInterest, ImpactMetric, SupabaseConfig } from '../types';

const STORAGE_CONFIG_KEY = 'pragati_setu_supabase_config';

let cachedClient: SupabaseClient | null = null;
let cachedConfig: SupabaseConfig | null = null;

export function getSavedSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) return cachedConfig;
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      cachedConfig = JSON.parse(raw);
      return cachedConfig!;
    }
  } catch {
    // Ignore error
  }

  // Check Vite environment variables if available
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  cachedConfig = {
    url: envUrl,
    anonKey: envKey,
    isConnected: false,
  };
  return cachedConfig;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  cachedConfig = config;
  cachedClient = null; // reset client to re-init
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Supabase config to local storage', err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false, // Local auth is handled independently per user prompt specification
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'Please provide both Supabase Project URL and Anon API Key' };
  }
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false },
    });
    const { data, error } = await client.from('problems').select('id').limit(1);
    if (error) {
      return { success: false, message: `Connected to Supabase, but query error: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to live Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Supabase URL' };
  }
}

export async function pullSupabaseData(): Promise<{
  problems?: Problem[];
  milestones?: Milestone[];
  proposals?: Proposal[];
  interests?: IndustryInterest[];
  impactMetrics?: ImpactMetric[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client not configured' };
  }

  try {
    const [probRes, mileRes, propRes, indRes, impRes] = await Promise.all([
      client.from('problems').select('*').order('created_at', { ascending: false }),
      client.from('milestones').select('*').order('created_at', { ascending: true }),
      client.from('proposals').select('*, proposal_students(*)').order('created_at', { ascending: false }),
      client.from('industry_interests').select('*').order('created_at', { ascending: false }),
      client.from('impact_metrics').select('*'),
    ]);

    if (probRes.error) throw probRes.error;

    return {
      problems: probRes.data || [],
      milestones: mileRes.data || [],
      proposals: propRes.data || [],
      interests: indRes.data || [],
      impactMetrics: impRes.data || [],
    };
  } catch (err: any) {
    return { error: err?.message || 'Failed to pull from Supabase' };
  }
}

export async function uploadEvidencePhoto(
  file: File | Blob,
  fileName: string,
): Promise<{ url?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase is not configured' };
  }

  try {
    const uniquePath = `evidence_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data, error } = await client.storage
      .from('problem-evidence')
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = client.storage
      .from('problem-evidence')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { error: err?.message || 'Failed to upload photo to Supabase storage' };
  }
}

export async function pushProblemToSupabase(problem: Problem): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'No client' };

  try {
    const { error } = await client.from('problems').insert([
      {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        domain: problem.domain,
        district: problem.district,
        lat: problem.lat,
        lng: problem.lng,
        location_source: problem.location_source,
        photo_urls: problem.photo_urls,
        status: problem.status,
        support_count: problem.support_count,
        submitted_by: problem.submitted_by,
        submitted_by_type: problem.submitted_by_type,
        created_at: problem.created_at,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
