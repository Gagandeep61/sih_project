import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PROFILES } from '../../constants';
import {
  Code2,
  Copy,
  Check,
  Smartphone,
  Database,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Users,
} from 'lucide-react';

export const ReactNativeCodeViewer: React.FC<{ onOpenSync: () => void; onOpenAuth: () => void }> = ({
  onOpenSync,
  onOpenAuth,
}) => {
  const { currentUser, supabaseConfig, quickLoginAs, triggerHaptics, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'app' | 'supabase' | 'expo'>('app');

  const reactNativeAppCode = `// React Native (Expo) - Jharkhand Pragati Setu
// Mobile App Architecture for Collaborative Societal Problem Resolution
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '${supabaseConfig.url || "https://your-project.supabase.co"}';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }, // Local Auth as per architecture
});

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setProblems(data);
    } catch (err) {
      console.log('Using local fallback cache:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#144718" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>झारखण्ड प्रगति सेतु</Text>
        <Text style={styles.headerSubtitle}>React Native Mobile App</Text>
      </View>
      <ScrollView style={styles.feed}>
        {/* Render Problems Feed, 1-click +1 Support, and 4-step report */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#1B5E20', padding: 16 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 12 },
  feed: { flex: 1, padding: 16 },
});
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reactNativeAppCode);
    setCopied(true);
    triggerHaptics();
    showToast('Copied to Clipboard', 'React Native source code copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3.5 space-y-4 text-stone-800 pb-10">
      {/* Settings & Sync Overview */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">Supabase & Database Status</h3>
              <div className="text-[10px] text-stone-500">
                {supabaseConfig.isConnected ? '🟢 Live Supabase Synced' : '🔵 Resilient Local Database Active'}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenSync}
            className="px-2.5 py-1 bg-[#1B5E20] text-white text-xs font-bold rounded-lg shadow"
          >
            Configure
          </button>
        </div>

        {/* Website link */}
        <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
          <span>Synced with Website:</span>
          <a
            href="https://jharkhand-project-seven.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-[#1B5E20] underline font-bold inline-flex items-center gap-1"
          >
            <span>Live Website</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* 1-Click Role Switcher Quick Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Users size={14} className="text-[#1B5E20]" />
            <span>Switch Active Role (Local Session)</span>
          </span>
          <button onClick={onOpenAuth} className="text-[10px] text-[#1B5E20] font-bold underline">
            All 12 Accounts
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => quickLoginAs(DEMO_PROFILES[0])}
            className={`p-2 rounded-xl border text-left font-medium transition-all ${
              currentUser?.role === 'admin'
                ? 'border-[#1B5E20] bg-emerald-50 text-[#1B5E20] font-bold'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            👑 State Admin
          </button>
          <button
            onClick={() => quickLoginAs(DEMO_PROFILES[1])}
            className={`p-2 rounded-xl border text-left font-medium transition-all ${
              currentUser?.role === 'citizen'
                ? 'border-[#1B5E20] bg-emerald-50 text-[#1B5E20] font-bold'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            👤 Citizen (Ramesh)
          </button>
          <button
            onClick={() => quickLoginAs(DEMO_PROFILES[2])}
            className={`p-2 rounded-xl border text-left font-medium transition-all ${
              currentUser?.role === 'university'
                ? 'border-[#1B5E20] bg-emerald-50 text-[#1B5E20] font-bold'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            🎓 IIT (ISM) Dhanbad
          </button>
          <button
            onClick={() => quickLoginAs(DEMO_PROFILES[7])}
            className={`p-2 rounded-xl border text-left font-medium transition-all ${
              currentUser?.role === 'industry'
                ? 'border-[#1B5E20] bg-emerald-50 text-[#1B5E20] font-bold'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            🏭 Tata Steel (CSR)
          </button>
        </div>
      </div>

      {/* React Native Expo Source Code Card */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Smartphone size={16} className="text-[#1B5E20]" />
            <h3 className="text-xs font-bold text-stone-900">React Native CLI / Expo Code</h3>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-600 leading-relaxed">
          The app interface you are testing in this simulator is fully mapped to React Native standards. You can copy this clean code directly into an Expo or React Native mobile project.
        </p>

        <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48 leading-relaxed">
          <pre>{reactNativeAppCode}</pre>
        </div>
      </div>
    </div>
  );
};
