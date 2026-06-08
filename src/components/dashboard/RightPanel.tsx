'use client';
import React from 'react';
import { ScenarioSnapshot } from '@/hooks/useScenario';

type RightPanelProps = {
  currentSnapshot?: ScenarioSnapshot;
};

const RightPanel: React.FC<RightPanelProps> = ({ currentSnapshot }) => {
  const factors = currentSnapshot?.shapData ?? [];
  const evacuationRoutes = currentSnapshot?.evacuationRoutes ?? [];
  const citizenRoute = currentSnapshot?.citizenRoute;

  return (
    <aside className="fixed top-14 bottom-0 right-0 w-[320px] overflow-y-auto bg-white">
      <div className="p-4 space-y-4">
        {/* Route Updated Notification */}
        {citizenRoute?.updateMessage && (
          <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
            <p className="text-[12px] font-bold text-blue-700">
              🔄 Route Updated
            </p>
            <p className="text-[11px] text-blue-600 mt-1">
              {citizenRoute.updateMessage}
            </p>
          </div>
        )}

        {/* Title */}
        <h2 className="font-bold text-[14px]" style={{ color: '#0D2B55' }}>
          🧠 AI Risk Analysis
        </h2>

        {/* SHAP Explanation Card */}
        <div className="rounded-lg p-4" style={{ backgroundColor: '#EBF4F7' }}>
          <h3 className="font-bold text-[13px] mb-3" style={{ color: '#0D2B55' }}>
            Why is Zone A at 82% risk?
          </h3>

          <div className="space-y-3">
            {factors.map((factor) => (
              <div key={factor.factor}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-gray-700">{factor.factor}</span>
                  <span className="text-[12px] font-bold" style={{ color: factor.color }}>
                    +{factor.value}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${factor.value}%`, backgroundColor: factor.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-500 mt-3">
            Source: XGBoost+SHAP Model · Validated by Meteo Rwanda
          </p>
        </div>

        {/* Active Evacuation Routes */}
        <h3 className="font-bold text-[13px]" style={{ color: '#0D2B55' }}>
          🛣 Active Evacuation Routes
        </h3>

        <div className="space-y-3">
          {/* Primary Route - Citizen Route */}
          {citizenRoute && (
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="text-[13px] font-bold text-gray-800 mb-1">{citizenRoute.name}</h4>
              <p className="text-[12px] font-bold mb-2" style={{ color: '#007A87' }}>
                {citizenRoute.distance} · {citizenRoute.duration}
              </p>
              {citizenRoute.status === 'safe' ? (
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-green-600 bg-green-100">
                  ✅ Currently Safe
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-red-600 bg-red-100">
                  BLOCKED
                </span>
              )}
              {citizenRoute.updateMessage && (
                <p className="text-[11px] text-gray-500 mt-1">{citizenRoute.updateMessage}</p>
              )}
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-500">Citizens on this route</span>
                  <span className="text-[10px] font-bold text-gray-700">34%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full bg-green-500" style={{ width: '34%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Other Routes */}
          {evacuationRoutes
            .filter((routeName) => routeName !== citizenRoute?.name)
            .map((routeName) => (
              <div key={routeName} className="border border-gray-200 rounded-lg p-3">
                <h4 className="text-[13px] font-bold text-gray-800 mb-1">{routeName}</h4>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-green-600 bg-green-100">
                  ✅ Currently Safe
                </span>
              </div>
            ))}
        </div>

        {/* Citizen App Status */}
        <h3 className="font-bold text-[13px]" style={{ color: '#0D2B55' }}>
          📱 Citizen App Status
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-1 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[12px] text-gray-700">Last route update: 2 min ago</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-gray-100">
            <span className="text-[12px] text-gray-700">Citizens navigating:</span>
            <span className="text-[12px] font-bold text-gray-800">847</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[12px] text-gray-700">SMS alerts sent:</span>
            <span className="text-[12px] font-bold text-gray-800">12,400</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;