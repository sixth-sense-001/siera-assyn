'use client';
import React, { useState, useEffect } from 'react';
import { useScenario } from '@/hooks/useScenario';
import { useFirebaseState } from '@/hooks/useFirebaseState';

const TopNav: React.FC = () => {
  const { state } = useFirebaseState();
  const { currentSnapshot } = useScenario(state.currentSnapshotIndex);
  const [time, setTime] = useState('10:25 AM');
  const [date, setDate] = useState('May 22, 2025');

  // Sync with current snapshot timestamp for realistic demo timeline mapping
  useEffect(() => {
    if (currentSnapshot?.timestamp) {
      const d = new Date(currentSnapshot.timestamp);
      // Format as 10:25 AM
      const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Format as May 22, 2025
      const formattedDate = d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
      setTime(formattedTime);
      setDate(formattedDate);
    }
  }, [currentSnapshot]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-6 border-b border-white/5 bg-[#060c18] select-none">
      {/* Left: Brand & Seal of Rwanda */}
      <div className="flex items-center gap-3">
        {/* Stylized high-fidelity SVG Coat of Arms of Rwanda */}
        <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-yellow-400 via-green-500 to-blue-500 rounded-full p-[1.5px] shadow-lg shadow-teal-500/10">
          <div className="w-full h-full bg-[#060c18] rounded-full flex items-center justify-center overflow-hidden relative">
            <svg viewBox="0 0 100 100" className="w-7 h-7 text-yellow-500" fill="currentColor">
              {/* Outer circle sunrays */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
              {/* Central Shield/Basket shape */}
              <path d="M50 25 L68 45 L50 65 L32 45 Z" fill="none" stroke="currentColor" strokeWidth="3" />
              {/* Sun icon at top */}
              <circle cx="50" cy="38" r="5" fill="currentColor" />
              {/* Branches/Leaves left/right */}
              <path d="M25 70 C25 55, 38 45, 42 45" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M75 70 C75 55, 62 45, 58 45" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              {/* Blue ribbon at bottom */}
              <path d="M30 72 Q50 78 70 72" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[11px] font-extrabold tracking-wider text-white uppercase leading-tight">
            Republic of Rwanda
          </span>
          <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase leading-none">
            Ministry of Environment
          </span>
        </div>
      </div>

      {/* Center: System Title */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-sm md:text-base font-extrabold text-white tracking-widest leading-tight">
          AI ENVIRONMENTAL RISK MONITORING SYSTEM
        </h1>
        <div className="text-[9px] font-bold text-teal-400 tracking-[0.2em] uppercase leading-none">
          Early Warning • Prevent • Protect
        </div>
      </div>

      {/* Right: Weather & Time Stats */}
      <div className="flex items-center gap-6">
        {/* Weather widget */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-6">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-cyan-400 filter drop-shadow(0 0 4px rgba(34,211,238,0.3))" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M17.72 17.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M17.72 6.28l1.06-1.06" className="opacity-30" />
            {/* Cloud */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25" fill="rgba(6, 12, 24, 0.8)" />
            {/* Raindrops */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v2M12 20v2M16 19v2" className="animate-bounce" />
          </svg>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-white">22°C</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-white leading-none">Kigali</span>
              <span className="text-[8px] font-bold text-gray-400 leading-none mt-0.5">Heavy Rain</span>
            </div>
          </div>
        </div>

        {/* Date and Time widget */}
        <div className="flex flex-col text-right">
          <span className="text-sm font-black text-white leading-tight tracking-wider">
            {time}
          </span>
          <span className="text-[9px] font-bold text-gray-400 tracking-wider">
            {date}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;

