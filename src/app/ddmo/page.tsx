'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/context/AuthContext';
import TopNav from '../../components/dashboard/TopNav';
import LeftSidebar from '../../components/dashboard/LeftSidebar';
import { useFirebaseState } from '@/hooks/useFirebaseState';
import { useScenario } from '@/hooks/useScenario';

const MapView = dynamic(() => import('../../components/dashboard/MapView'), { ssr: false });

function DDMOPageContent() {
  const { role, login, isLoading } = useAuth();
  const { state: firebaseState, loading } = useFirebaseState();
  const { currentSnapshot } = useScenario(firebaseState.currentSnapshotIndex);

  useEffect(() => {
    if (!isLoading && role !== 'ddmo') {
      login('ddmo');
    }
  }, [isLoading, role, login]);

  if (isLoading || loading) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020813]">
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading Command Center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020813] text-slate-100">
      <TopNav />
      <div className="flex flex-1 overflow-hidden pt-14 relative">
        <LeftSidebar currentSnapshot={currentSnapshot} />
        {/* MapView will occupy the rest, side panels are overlaid on map */}
        <MapView />
      </div>
    </div>
  );
}

export default function DDMOPage() {
  return (
    <AuthProvider>
      <DDMOPageContent />
    </AuthProvider>
  );
}