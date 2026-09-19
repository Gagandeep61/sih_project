import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileShell } from './components/mobile/MobileShell';
import { LocalAuthModal } from './components/auth/LocalAuthModal';
import { SupabaseSyncModal } from './components/sync/SupabaseSyncModal';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { UniversityPortal } from './components/university/UniversityPortal';
import { IndustryPortal } from './components/industry/IndustryPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { ReactNativeCodeViewer } from './components/export/ReactNativeCodeViewer';

const MainApp: React.FC = () => {
  const { currentUser } = useApp();
  const role = currentUser?.role || 'citizen';

  // Modal open states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // Tab state based on active role
  const [activeTab, setActiveTab] = useState<string>('explore');

  // When user role changes, switch to the role's default primary tab
  useEffect(() => {
    if (role === 'citizen') {
      setActiveTab('explore');
    } else if (role === 'university') {
      setActiveTab('queue');
    } else if (role === 'industry') {
      setActiveTab('proposals');
    } else if (role === 'admin') {
      setActiveTab('overview');
    }
  }, [role]);

  const renderCurrentView = () => {
    if (role === 'citizen') {
      switch (activeTab) {
        case 'report':
          return <CitizenPortal activeSubView="report" />;
        case 'my-reports':
          return <CitizenPortal activeSubView="my-reports" />;
        case 'settings':
          return (
            <ReactNativeCodeViewer
              onOpenSync={() => setSyncModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          );
        case 'explore':
        default:
          return <CitizenPortal activeSubView="explore" />;
      }
    }

    if (role === 'university') {
      switch (activeTab) {
        case 'proposal':
          return <UniversityPortal activeSubView="proposal" />;
        case 'milestones':
          return <UniversityPortal activeSubView="milestones" />;
        case 'archive':
          return <UniversityPortal activeSubView="archive" />;
        case 'queue':
        default:
          return <UniversityPortal activeSubView="queue" />;
      }
    }

    if (role === 'industry') {
      switch (activeTab) {
        case 'pledge':
          return <IndustryPortal activeSubView="pledge" />;
        case 'proofs':
          return <IndustryPortal activeSubView="proofs" />;
        case 'settings':
          return (
            <ReactNativeCodeViewer
              onOpenSync={() => setSyncModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          );
        case 'proposals':
        default:
          return <IndustryPortal activeSubView="proposals" />;
      }
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'override':
          return <AdminPortal activeSubView="override" />;
        case 'codes':
          return <AdminPortal activeSubView="codes" />;
        case 'proofs':
          return <AdminPortal activeSubView="proofs" />;
        case 'overview':
        default:
          return <AdminPortal activeSubView="overview" />;
      }
    }

    return <CitizenPortal activeSubView="explore" />;
  };

  return (
    <>
      <MobileShell
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSync={() => setSyncModalOpen(true)}
      >
        {renderCurrentView()}
      </MobileShell>

      {/* Local Authentication & 1-Click Evaluation Drawer */}
      <LocalAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Supabase Live Database & Storage Bucket Configuration */}
      <SupabaseSyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
