import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  RefreshCw,
  Globe,
  Smartphone,
  CheckCircle2,
  Database,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenSync }) => {
  const {
    currentUser,
    language,
    setLanguage,
    deviceFrame,
    setDeviceFrame,
    supabaseConfig,
    isSyncing,
    syncWithSupabase,
    logout,
  } = useApp();

  return (
    <header className="bg-[#1B5E20] text-white border-b border-[#144718] sticky top-0 z-30 select-none shadow-md">
      {/* Top Gov Authority Ribbon */}
      <div className="bg-[#144718] px-3 py-1 flex items-center justify-between text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-1.5 opacity-90">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E65100]"></span>
          <span>GOVERNMENT OF JHARKHAND • SIH26043</span>
        </div>

        {/* Viewport Frame Switcher & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-white text-[11px]"
            title="Toggle English / हिन्दी"
          >
            <Globe size={11} />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Device Frame Switcher */}
          <div className="flex items-center bg-black/20 rounded p-0.5">
            <button
              id="frame-pixel-btn"
              onClick={() => setDeviceFrame('pixel')}
              className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-all ${
                deviceFrame === 'pixel' ? 'bg-[#E65100] text-white' : 'text-white/70 hover:text-white'
              }`}
              title="Android Pixel View"
            >
              Pixel
            </button>
            <button
              id="frame-iphone-btn"
              onClick={() => setDeviceFrame('iphone')}
              className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-all ${
                deviceFrame === 'iphone' ? 'bg-[#E65100] text-white' : 'text-white/70 hover:text-white'
              }`}
              title="iOS iPhone View"
            >
              iPhone
            </button>
            <button
              id="frame-full-btn"
              onClick={() => setDeviceFrame('fullscreen')}
              className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition-all ${
                deviceFrame === 'fullscreen' ? 'bg-[#E65100] text-white' : 'text-white/70 hover:text-white'
              }`}
              title="Responsive Canvas"
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Main App Title Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Official Emblem Icon */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner text-[#1B5E20] border-2 border-[#E65100]">
            <Shield size={18} className="text-[#1B5E20]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight flex items-center gap-1.5">
              <span>{language === 'hi' ? 'झारखण्ड प्रगति सेतु' : 'Jharkhand Pragati Setu'}</span>
              <span className="text-[9px] bg-[#E65100] text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                React Native
              </span>
            </h1>
            <p className="text-[10px] text-white/80 leading-none">
              {language === 'hi'
                ? 'उच्च एवं तकनीकी शिक्षा विभाग • नागरिक-संस्थान सहभागिता'
                : 'Dept. of Higher & Technical Education • Governance App'}
            </p>
          </div>
        </div>

        {/* Sync & User Controls */}
        <div className="flex items-center gap-1.5">
          {/* Supabase Status Pill */}
          <button
            id="supabase-sync-header-btn"
            onClick={onOpenSync}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-900/60 border-emerald-400 text-emerald-100 hover:bg-emerald-800'
                : 'bg-amber-900/40 border-amber-300/60 text-amber-200 hover:bg-amber-800/60'
            }`}
            title="Configure & Sync Supabase Database"
          >
            <Database size={11} className={isSyncing ? 'animate-spin' : ''} />
            <span className="font-medium">{supabaseConfig.isConnected ? 'Cloud Synced' : 'Local + Sync'}</span>
          </button>

          {/* User Profile Pill / Login Trigger */}
          {currentUser ? (
            <button
              id="user-profile-header-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded-full text-[11px] text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="max-w-[80px] truncate font-medium">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[9px] uppercase px-1 py-0.2 bg-white/20 rounded font-semibold">
                {currentUser.role === 'admin'
                  ? 'Admin'
                  : currentUser.role === 'university'
                  ? 'Univ'
                  : currentUser.role === 'industry'
                  ? 'CSR'
                  : 'Citizen'}
              </span>
            </button>
          ) : (
            <button
              id="login-header-btn"
              onClick={onOpenAuth}
              className="text-[11px] bg-white text-[#1B5E20] font-bold px-2.5 py-1 rounded-full shadow hover:bg-amber-50 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
