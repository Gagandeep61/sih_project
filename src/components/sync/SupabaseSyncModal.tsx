import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { testSupabaseConnection } from '../../lib/supabase';
import {
  X,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  ArrowDownUp,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { supabaseConfig, updateSupabaseConfig, isSyncing, syncWithSupabase, problems } = useApp();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult(null);

    const test = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(test);
    setTesting(false);

    if (test.success) {
      await updateSupabaseConfig(url.trim(), anonKey.trim());
    }
  };

  const handleManualSync = async () => {
    const res = await syncWithSupabase();
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1B5E20] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">Supabase Sync & Cloud Storage</h2>
              <p className="text-[11px] text-emerald-100">Live PostgreSQL Database & Evidence Bucket</p>
            </div>
          </div>
          <button
            id="close-sync-modal-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-stone-800">
          {/* Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {supabaseConfig.isConnected ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold">
                  {supabaseConfig.isConnected ? 'Connected to Live Supabase' : 'Offline / Local Resilient Engine'}
                </div>
                <div className="text-[10px] opacity-80">
                  {supabaseConfig.lastSyncedAt
                    ? `Last synced: ${supabaseConfig.lastSyncedAt}`
                    : '10 seed problems + triggers loaded locally'}
                </div>
              </div>
            </div>

            <button
              id="manual-sync-trigger-btn"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#154a19] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Test & Result Alerts */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Supabase Credentials Form */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
            <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <HardDrive size={15} className="text-[#1B5E20]" />
              <span>Connect Website Supabase Project</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              To keep the mobile app in bidirectional sync with your website (
              <a
                href="https://jharkhand-project-seven.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-[#1B5E20] underline font-medium inline-flex items-center gap-0.5"
              >
                jharkhand-project-seven.vercel.app <ExternalLink size={10} />
              </a>
              ), enter your project API credentials below:
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
              />
            </div>

            <button
              id="test-save-supabase-btn"
              onClick={handleTestAndSave}
              disabled={testing}
              className="w-full py-2 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying Connection...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Verify Connection & Save</span>
                </>
              )}
            </button>
          </div>

          {/* Synchronized Tables & Bucket Architecture */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <Layers size={14} className="text-[#1B5E20]" />
              <span>Synchronized Data Schemas & Storage</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                <div className="font-bold text-[#1B5E20] flex items-center justify-between">
                  <span>public.problems</span>
                  <span className="text-[10px] bg-stone-100 px-1 rounded font-mono">{problems.length}</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Silent GPS, 24 districts, 11 domains, photo URLs.
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                <div className="font-bold text-[#1B5E20] flex items-center justify-between">
                  <span>storage.objects</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono">Bucket</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  <code className="font-mono text-[9px] bg-stone-100 px-1 py-0.5 rounded">problem-evidence</code>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                <div className="font-bold text-[#1B5E20]">public.milestones</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  DB trigger syncs status (in_progress & completed).
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                <div className="font-bold text-[#1B5E20]">public.problem_supporters</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Enforces 1 upvote per citizen per issue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
