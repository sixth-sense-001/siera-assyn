'use client';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function RoleSelectionScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const handleSelectRole = (selectedRole: 'ddmo' | 'citizen') => {
    login(selectedRole);
    router.push(selectedRole === 'ddmo' ? '/ddmo' : '/citizen');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-[#020813] overflow-hidden">
      {/* Animated Glowing Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/20 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header Info */}
      <div className="relative z-10 text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-semibold mb-4 tracking-wide uppercase">
          🛰️ SIERA Early Warning Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          AI Environmental Risk <span className="text-teal-400">&</span> Evacuation System
        </h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Integrated GIS disaster monitoring and dynamic evacuation routing for the Republic of Rwanda, Ministry of Environment.
        </p>
      </div>

      {/* Portal Grid */}
      <div className="relative z-10 grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Citizen View Card */}
        <button
          onClick={() => handleSelectRole('citizen')}
          className="group relative text-left rounded-3xl p-8 transition-all duration-300 border border-white/5 hover:border-teal-500/30 bg-white/[0.02] hover:bg-white/[0.04] shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >
          {/* Glowing gradient border on hover */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 text-teal-400">
              📱
            </div>
            <span className="text-xs font-bold text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Citizen View
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
            Citizen Evacuation Portal
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
            Interactive mobile simulator matching the live user tracking interface. View calculated safe evacuation paths, active landslide zones, and real-time navigation guides.
          </p>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            Launch Mobile App <span>→</span>
          </div>
        </button>

        {/* DDMO View Card */}
        <button
          onClick={() => handleSelectRole('ddmo')}
          className="group relative text-left rounded-3xl p-8 transition-all duration-300 border border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.04] shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >
          {/* Glowing gradient border on hover */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 text-blue-400">
              🛰️
            </div>
            <span className="text-xs font-bold text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Admin / DDMO
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
            Command Center Dashboard
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
            GIS map with high-resolution satellite imagery overlay. Features SHAP risk analytics, vegetation density sliders, active flood hazard zones, and full timeline synchronization.
          </p>

          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            Enter Command Center <span>→</span>
          </div>
        </button>
      </div>

      <div className="relative z-10 text-[11px] text-gray-600 mt-16 text-center">
        Republic of Rwanda · Ministry of Environment · Disaster Preparedness Division
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <RoleSelectionScreen />
    </AuthProvider>
  );
}

