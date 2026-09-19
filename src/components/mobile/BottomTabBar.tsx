import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  PlusCircle,
  Clock,
  Settings,
  Sparkles,
  FileCheck2,
  GitPullRequest,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Award,
  BarChart3,
  SlidersHorizontal,
  KeyRound,
  FileText,
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const { currentUser, language, triggerHaptics } = useApp();
  const role = currentUser?.role || 'citizen';

  // Define tabs per role
  let tabs: { id: string; label: string; labelHi: string; icon: React.ReactNode; isPrimary?: boolean }[] = [];

  if (role === 'citizen') {
    tabs = [
      { id: 'explore', label: 'Explore', labelHi: 'अन्वेषण', icon: <Compass size={20} /> },
      { id: 'report', label: 'Report +', labelHi: 'शिकायत दर्ज', icon: <PlusCircle size={22} />, isPrimary: true },
      { id: 'my-reports', label: 'My Status', labelHi: 'मेरी स्थिति', icon: <Clock size={20} /> },
      { id: 'settings', label: 'Sync & Auth', labelHi: 'सिंक व खाता', icon: <Settings size={20} /> },
    ];
  } else if (role === 'university') {
    tabs = [
      { id: 'queue', label: 'Match Queue', labelHi: 'मैच कतार', icon: <Sparkles size={20} /> },
      { id: 'proposal', label: 'Propose Team', labelHi: 'प्रस्ताव व दल', icon: <FileCheck2 size={22} />, isPrimary: true },
      { id: 'milestones', label: 'Milestones', labelHi: 'माइलस्टोन', icon: <GitPullRequest size={20} /> },
      { id: 'archive', label: 'Lessons', labelHi: 'अभिलेख', icon: <BookOpen size={20} /> },
    ];
  } else if (role === 'industry') {
    tabs = [
      { id: 'proposals', label: 'Proposals', labelHi: 'प्रस्ताव सूची', icon: <Briefcase size={20} /> },
      { id: 'pledge', label: 'CSR Pledge', labelHi: 'सीएसआर मदद', icon: <HeartHandshake size={22} />, isPrimary: true },
      { id: 'proofs', label: 'Resolution', labelHi: 'समाधान प्रमाण', icon: <Award size={20} /> },
      { id: 'settings', label: 'Sync & Auth', labelHi: 'सिंक व खाता', icon: <Settings size={20} /> },
    ];
  } else {
    // Admin
    tabs = [
      { id: 'overview', label: 'State KPIs', labelHi: 'राज्य सूचकांक', icon: <BarChart3 size={20} /> },
      { id: 'override', label: 'Override', labelHi: 'हस्तक्षेप', icon: <SlidersHorizontal size={20} /> },
      { id: 'codes', label: 'Access Codes', labelHi: 'एक्सेस कोड', icon: <KeyRound size={22} />, isPrimary: true },
      { id: 'proofs', label: 'Audit Proofs', labelHi: 'प्रमाण सत्यापन', icon: <FileText size={20} /> },
    ];
  }

  const handleSelect = (tabId: string) => {
    triggerHaptics();
    onTabChange(tabId);
  };

  return (
    <nav
      id="mobile-bottom-nav"
      className="bg-white border-t border-stone-200 py-1.5 px-2 flex items-center justify-around select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        if (tab.isPrimary) {
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleSelect(tab.id)}
              className="flex flex-col items-center justify-center -mt-4 transition-transform active:scale-95 group focus:outline-none"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                  isActive
                    ? 'bg-[#E65100] text-white ring-2 ring-[#E65100]/40'
                    : 'bg-[#1B5E20] text-white hover:bg-[#154a19]'
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 tracking-tight ${
                  isActive ? 'text-[#E65100]' : 'text-stone-700'
                }`}
              >
                {language === 'hi' ? tab.labelHi : tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => handleSelect(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[62px] active:scale-95 focus:outline-none ${
              isActive ? 'text-[#1B5E20] font-semibold' : 'text-stone-500 hover:text-stone-800 font-normal'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#1B5E20]/10' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {language === 'hi' ? tab.labelHi : tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
