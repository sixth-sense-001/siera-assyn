'use client';
import { AuthProvider } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const CitizenMap = dynamic(() => import('../../components/Citizen/CitizenMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020813]">
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-sm">Initializing system...</div>
      </div>
    </div>
  ),
});

export default function CitizenPage() {
  return (
    <AuthProvider>
      <CitizenMap />
    </AuthProvider>
  );
}