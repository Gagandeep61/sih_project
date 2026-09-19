import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { BottomTabBar } from './BottomTabBar';
import {
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSync: () => void;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenSync,
}) => {
  const { deviceFrame, setDeviceFrame, toast, currentUser, quickLoginAs } = useApp();
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col h-full bg-[#F8F9FA] text-[#1C1B1F] relative overflow-hidden font-sans">
      {/* Native Mobile Status Bar */}
      <div className="bg-[#144718] text-white px-5 pt-1.5 pb-1 flex items-center justify-between text-xs font-semibold select-none z-40">
        <span className="tracking-tight text-[11px] font-mono">{currentTime}</span>

        {/* Dynamic Island or Camera Punch Hole */}
        {deviceFrame === 'iphone' ? (
          <div className="w-20 h-3.5 bg-black rounded-full flex items-center justify-end px-1.5 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
          </div>
        ) : deviceFrame === 'pixel' ? (
          <div className="w-3 h-3 bg-black rounded-full border border-stone-800"></div>
        ) : null}

        {/* Status Icons */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[10px] font-bold">5G</span>
          <Signal size={11} />
          <Wifi size={11} />
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-mono">98%</span>
            <Battery size={13} className="fill-white" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <Header onOpenAuth={onOpenAuth} onOpenSync={onOpenSync} />

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative focus:outline-none">
        {children}
      </main>

      {/* Native Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Bottom Home Indicator Gesture Bar */}
      <div className="bg-white pb-1.5 pt-0.5 flex justify-center items-center select-none">
        <div className="w-32 h-1 bg-stone-300 rounded-full"></div>
      </div>

      {/* Global In-App Toast Notification */}
      {toast && (
        <div
          id="in-app-toast-alert"
          role="alert"
          className={`fixed top-16 left-4 right-4 z-50 p-3 rounded-xl shadow-xl border flex items-start gap-2.5 animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-[#1B5E20] text-white border-emerald-400'
              : toast.type === 'error'
              ? 'bg-[#B3261E] text-white border-rose-400'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-300" />
            ) : toast.type === 'error' ? (
              <AlertTriangle size={16} className="text-amber-300" />
            ) : (
              <Info size={16} className="text-sky-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold leading-tight">{toast.title}</div>
            <div className="text-[11px] opacity-90 leading-tight mt-0.5">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );

  if (deviceFrame === 'fullscreen') {
    return (
      <div className="w-full h-screen flex justify-center bg-stone-100">
        <div className="w-full max-w-md h-full shadow-2xl relative overflow-hidden bg-white">
          {content}
        </div>
      </div>
    );
  }

  // Mobile Device Frame (Android Pixel 9 or iPhone 16 Pro)
  return (
    <div className="min-h-screen bg-stone-900 py-4 px-2 sm:px-4 flex flex-col items-center justify-center">
      {/* Top Floating Evaluation Helper Pill */}
      <div className="w-full max-w-md mb-2 flex items-center justify-between text-stone-300 text-xs px-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-white">React Native Mobile Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="quick-demo-roles-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700/60 hover:bg-emerald-700 text-emerald-200 text-[11px] font-medium transition-colors"
          >
            <Users size={12} />
            <span>1-Click Switch Role</span>
          </button>
        </div>
      </div>

      {/* Simulated Smartphone Chassis */}
      <div
        className={`relative w-full max-w-[395px] h-[835px] max-h-[92vh] bg-stone-950 rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 ${
          deviceFrame === 'iphone' ? 'border-stone-700' : 'border-stone-800'
        } transition-all duration-300`}
      >
        {/* Exterior Volume Buttons Simulation */}
        <div className="absolute -left-5 top-24 w-1.5 h-10 bg-stone-700 rounded-l-md"></div>
        <div className="absolute -left-5 top-36 w-1.5 h-10 bg-stone-700 rounded-l-md"></div>
        <div className="absolute -right-5 top-28 w-1.5 h-14 bg-stone-700 rounded-r-md"></div>

        {/* Screen Display Area */}
        <div className="w-full h-full rounded-[34px] overflow-hidden shadow-inner bg-white flex flex-col">
          {content}
        </div>
      </div>
    </div>
  );
};
