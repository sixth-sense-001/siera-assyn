'use client';
import React, { useState } from 'react';

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

const LeftSidebar: React.FC<{ currentSnapshot?: any }> = () => {
  const [activeTab, setActiveTab] = useState('satellite');

  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'satellite',
      label: 'SATELLITE',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <path d="M8 12a4 4 0 018 0" />
        </svg>
      ),
    },
    {
      id: 'vegetation',
      label: 'VEGETATION',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" className="opacity-20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      id: 'terrain',
      label: 'TERRAIN',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 18l4-4 4 4m-8-4l4-4 4 4" />
          <path d="M3 20h18" />
        </svg>
      ),
    },
    {
      id: 'settlement',
      label: 'SETTLEMENT',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M3 10l9-7 9 7v11H3V10z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      id: 'drainage',
      label: 'DRAINAGE',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      id: 'infrastructure',
      label: 'INFRASTRUCTURE',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      ),
    },
    {
      id: 'alerts',
      label: 'RISK ALERTS',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      badge: 6,
    },
    {
      id: 'reports',
      label: 'REPORTS',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed top-14 bottom-0 left-0 w-[72px] flex flex-col items-center py-4 border-r border-white/5 bg-[#060c18] z-40 select-none">
      {/* Hamburger Menu Icon at Top */}
      <button className="text-gray-400 hover:text-white p-2 rounded-lg mb-6 transition-colors duration-200 cursor-pointer">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Vertical Navigation Tabs */}
      <div className="flex-1 w-full flex flex-col items-center gap-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full py-3 flex flex-col items-center justify-center transition-all duration-300 border-l-[3px] cursor-pointer group ${
                isActive
                  ? 'border-l-[#00FF88] text-[#00FF88] bg-gradient-to-r from-[#00FF88]/5 to-transparent'
                  : 'border-l-transparent text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              {/* Icon */}
              <div className={`transition-transform duration-300 group-hover:scale-105 ${isActive ? 'filter drop-shadow(0 0 3px rgba(0,255,136,0.3))' : ''}`}>
                {item.icon}
              </div>

              {/* Text Label */}
              <span className="text-[7.5px] font-extrabold tracking-widest mt-1.5 text-center leading-none scale-[0.9]">
                {item.label}
              </span>

              {/* Optional Alert Badge */}
              {item.badge !== undefined && (
                <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8.5px] font-bold text-white leading-none scale-[0.85] border border-[#060c18]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default LeftSidebar;

