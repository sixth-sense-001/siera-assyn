'use client';
import React, { useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { PolygonLayer, PathLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Play, Pause } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import timelineData from '@/data/scenario-timeline.json';
import graphData from '@/data/nyabihu-graph.json';

const mapStyle: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    },
    'esri-reference': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    },
    'esri-transportation': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    }
  },
  layers: [
    { id: 'satellite', type: 'raster', source: 'esri-satellite' },
    { id: 'reference', type: 'raster', source: 'esri-reference' },
    { id: 'transportation', type: 'raster', source: 'esri-transportation' }
  ]
};

// Heatmap mock data based on threat locations
const heatmapData = [
  { coordinates: [29.522, -1.584], weight: 10 },
  { coordinates: [29.516, -1.570], weight: 5 },
  { coordinates: [29.533, -1.578], weight: 8 },
  { coordinates: [29.511, -1.583], weight: 9 }
];

const BivariatePinComponent = ({ threatType, isCritical, onClick }: any) => {
  const pinColor = isCritical ? 'bg-[#FF3B30] border-red-400' : 'bg-[#FF9500] border-orange-300';
  const pulseColor = isCritical ? 'bg-[#FF3B30]/40' : 'bg-[#FF9500]/40';
  
  let icon = '⚠️';
  if (threatType === 'landslide') icon = '⛰️';
  if (threatType === 'flood') icon = '🌊';
  if (threatType === 'settlement') icon = '🏠';
  if (threatType === 'drainage') icon = '🚧';

  return (
    <div onClick={onClick} className="relative flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform">
      <div className={`absolute -top-3 -right-3 w-5 h-5 rounded-full ${pinColor} border flex items-center justify-center shadow-lg shadow-black/50 z-10 text-[10px]`}>
        {icon}
      </div>
      <div className={`absolute w-8 h-8 ${pulseColor} rounded-full animate-ping`}></div>
      <div className={`w-5 h-5 ${pinColor} rounded-full border-2 border-white shadow-xl flex items-center justify-center`}>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default function MapView() {
  const { 
    currentSnapshotIndex, setCurrentSnapshotIndex, 
    activeLayerToggles, toggleLayer,
    selectedThreatNode, setSelectedThreatNode,
    playbackStatus, setPlaybackStatus,
    citizenReports
  } = useDashboardStore();

  const currentSnapshot = timelineData.snapshots[currentSnapshotIndex];

  // Play/pause timeline automatic run
  useEffect(() => {
    if (playbackStatus !== 'playing') return;
    const interval = setInterval(() => {
      const next = (currentSnapshotIndex + 1) % timelineData.snapshots.length;
      setCurrentSnapshotIndex(next);
    }, 8000); 
    return () => clearInterval(interval);
  }, [playbackStatus, currentSnapshotIndex, setCurrentSnapshotIndex]);

  const deckLayers = [
    // 1. Fluid Flood Plumes (PolygonLayer)
    new PolygonLayer({
      id: 'flood-plumes',
      data: currentSnapshot.floodZones || [],
      getPolygon: (d: any) => d.polygonContours,
      getFillColor: [59, 130, 246, 80], // Blue flowing color
      getLineColor: [59, 130, 246, 255],
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      updateTriggers: {
        data: [currentSnapshotIndex]
      }
    }),

    // 2. Dynamic Infrastructure Layer (PathLayer)
    new PathLayer({
      id: 'road-network',
      data: graphData.edges,
      getPath: (d: any) => d.geometry || [],
      getColor: (d: any) => {
        const isBlocked = (currentSnapshot.blockedRoadIds as string[])?.includes(d.id);
        return isBlocked ? [255, 59, 48, 255] : [255, 255, 255, 180]; // Red if blocked, else white
      },
      getWidth: (d: any) => {
        const isBlocked = (currentSnapshot.blockedRoadIds as string[])?.includes(d.id);
        return isBlocked ? 6 : 3;
      },
      getDashArray: (d: any) => {
        const isBlocked = (currentSnapshot.blockedRoadIds as string[])?.includes(d.id);
        return isBlocked ? [4, 2] : [1, 0];
      },
      dashJustified: true,
      dashGapPickable: true,
      widthUnits: 'pixels',
      updateTriggers: {
        getColor: [currentSnapshotIndex],
        getWidth: [currentSnapshotIndex],
        getDashArray: [currentSnapshotIndex]
      }
    }),

    // 3. Topographical Slope Risk (HeatmapLayer)
    ...(activeLayerToggles.heatmap ? [
      new HeatmapLayer({
        id: 'slope-risk-heatmap',
        data: heatmapData,
        getPosition: (d) => d.coordinates,
        getWeight: (d) => d.weight * (currentSnapshot.riskLevel / 100),
        radiusPixels: 80,
        intensity: 1,
        threshold: 0.1,
        colorRange: [
          [255, 255, 178, 50],
          [254, 204, 92, 100],
          [253, 141, 60, 150],
          [240, 59, 32, 200],
          [189, 0, 38, 255]
        ],
        updateTriggers: {
          getWeight: [currentSnapshotIndex]
        }
      })
    ] : [])
  ];

  return (
    <div className="absolute inset-0 z-10" style={{ marginLeft: '72px' }}>
      <Map
        initialViewState={{
          longitude: 29.522,
          latitude: -1.579,
          zoom: 14,
          pitch: 45
        }}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%', filter: 'grayscale(30%)' }}
      >
        <DeckGL 
          initialViewState={{ longitude: 29.522, latitude: -1.579, zoom: 14, pitch: 45 }}
          controller={true}
          layers={deckLayers}
        />

        {/* Hazard Elements (Markers) */}
        <Marker longitude={29.522} latitude={-1.584} anchor="center">
          <BivariatePinComponent threatType="landslide" isCritical={true} onClick={(e: any) => { e.originalEvent.stopPropagation(); setSelectedThreatNode({ title: "HIGH LANDSLIDE RISK", zone: "Karago - Steep Slopes", cause: "Rapid vegetation loss and unplanned construction on steep slopes.", type: "landslide", pop: 850, isRed: true, riskIndex: 92 }); }} />
        </Marker>
        <Marker longitude={29.516} latitude={-1.570} anchor="center">
          <BivariatePinComponent threatType="drainage" isCritical={false} onClick={(e: any) => { e.originalEvent.stopPropagation(); setSelectedThreatNode({ title: "DRAINAGE OBSTRUCTION", zone: "Jenda Sector", cause: "Infrastructure blocking natural water flow increasing flood risk.", type: "drainage", pop: 420, isRed: false, riskIndex: 65 }); }} />
        </Marker>
        <Marker longitude={29.533} latitude={-1.578} anchor="center">
          <BivariatePinComponent threatType="settlement" isCritical={true} onClick={(e: any) => { e.originalEvent.stopPropagation(); setSelectedThreatNode({ title: "SETTLEMENT EXPANSION WARNING", zone: "Mukamira Junction", cause: "Houses constructed within flood-prone terrain.", type: "settlement", pop: 1200, isRed: true, riskIndex: 88 }); }} />
        </Marker>
        <Marker longitude={29.511} latitude={-1.583} anchor="center">
          <BivariatePinComponent threatType="flood" isCritical={false} onClick={(e: any) => { e.originalEvent.stopPropagation(); setSelectedThreatNode({ title: "FLOOD ACCUMULATION RISK", zone: "Sebeya River Floodplains", cause: "Low-lying area, poor drainage, heavy rainfall accumulation.", type: "flood", pop: 600, isRed: false, riskIndex: 50 }); }} />
        </Marker>

        {/* Citizen Telemetry Reports */}
        {citizenReports.map(report => (
          <Marker key={report.id} longitude={report.coordinates[0]} latitude={report.coordinates[1]} anchor="center">
            <div className="relative flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform select-none">
              <div className="absolute w-8 h-8 bg-amber-500/40 rounded-full animate-ping"></div>
              <div className="w-5 h-5 bg-amber-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center z-10 text-[10px]">
                📱
              </div>
              <div className="mt-1 bg-amber-500/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-white/20 whitespace-nowrap shadow-lg">
                Citizen Report
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Floating Panel 2: Bottom-Left Map Layers Filter & Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel w-72 rounded-2xl border border-white/10 shadow-2xl p-4 text-white select-none pointer-events-auto bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="flex border-b border-white/10 pb-2 mb-3 text-[8.5px] font-bold tracking-wider text-gray-400">
          <button onClick={() => toggleLayer('vegetation')} className={`flex-1 pb-1.5 text-center cursor-pointer border-b-[2px] transition-colors uppercase ${activeLayerToggles.vegetation ? 'border-teal-400 text-teal-400 font-black' : 'border-transparent hover:text-white'}`}>Vegetation</button>
          <button onClick={() => toggleLayer('slope')} className={`flex-1 pb-1.5 text-center cursor-pointer border-b-[2px] transition-colors uppercase ${activeLayerToggles.slope ? 'border-teal-400 text-teal-400 font-black' : 'border-transparent hover:text-white'}`}>Slope</button>
          <button onClick={() => toggleLayer('drainage')} className={`flex-1 pb-1.5 text-center cursor-pointer border-b-[2px] transition-colors uppercase ${activeLayerToggles.drainage ? 'border-teal-400 text-teal-400 font-black' : 'border-transparent hover:text-white'}`}>Drainage</button>
          <button onClick={() => toggleLayer('heatmap')} className={`flex-1 pb-1.5 text-center cursor-pointer border-b-[2px] transition-colors uppercase ${activeLayerToggles.heatmap ? 'border-[#FF3B30] text-[#FF3B30] font-black' : 'border-transparent hover:text-white'}`}>Heatmap</button>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-[8px] font-bold text-gray-400 mb-1">
            <span className="uppercase">Density Index</span><span className="text-teal-400">Low - High</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 border border-white/5"></div>
        </div>
      </div>

      {/* Timeline Controller HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px] z-[1000] bg-[#0B0F19]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 select-none pointer-events-auto">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#34C759] tracking-widest uppercase flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse"></div>
              Timeline Sync
            </span>
            <span className="text-sm font-bold text-white mt-0.5">{currentSnapshot?.title || 'Loading'}</span>
          </div>
          <button 
            onClick={() => setPlaybackStatus(playbackStatus === 'playing' ? 'paused' : 'playing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors font-bold text-xs uppercase tracking-widest ${
              playbackStatus === 'playing' 
                ? 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30' 
                : 'bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30'
            }`}
          >
            {playbackStatus === 'playing' ? <><Pause size={14}/> PAUSE</> : <><Play size={14}/> PLAY</>}
          </button>
        </div>

        <div className="relative pt-2 pb-4 px-2">
          <input
            type="range"
            min={0}
            max={timelineData.snapshots.length - 1}
            value={currentSnapshotIndex}
            onChange={(e) => setCurrentSnapshotIndex(Number(e.target.value))}
            className="w-full appearance-none bg-transparent cursor-pointer relative z-10"
            style={{ height: '4px' }}
          />
          <div className="absolute top-[12px] left-2 right-2 h-1.5 bg-gray-800 rounded-full pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-[#00b8d4] to-[#34C759] rounded-full transition-all duration-300"
              style={{ width: `${(currentSnapshotIndex / (timelineData.snapshots.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            input[type=range]::-webkit-slider-thumb {
              appearance: none;
              width: 44px;
              height: 44px;
              background: #F3F4F6;
              border: 4px solid #00b8d4;
              border-radius: 50%;
              box-shadow: 0 0 15px rgba(0,184,212,0.6);
              margin-top: -20px;
              transition: transform 0.1s;
            }
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.1);
            }
          `}} />

          <div className="flex justify-between mt-4 px-2">
            {timelineData.snapshots.map((snap, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-[1px] h-2 bg-gray-600 mb-1.5"></div>
                <span className={`text-[9px] font-black ${currentSnapshotIndex === idx ? 'text-[#34C759] scale-110' : 'text-gray-500'} transition-all`}>
                  {new Date(snap.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Inspector Side-Drawer (Radix UI Dialog) */}
      <Dialog.Root open={!!selectedThreatNode} onOpenChange={(isOpen) => !isOpen && setSelectedThreatNode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1500] bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-0 right-0 bottom-0 w-[380px] z-[2000] bg-[#0B0F19]/95 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.6)] outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
            {selectedThreatNode && (
              <>
                <div className={`p-6 border-b border-white/10 flex flex-col gap-3 ${selectedThreatNode.isRed ? 'bg-gradient-to-b from-[#FF3B30]/20 to-transparent' : 'bg-gradient-to-b from-[#FF9500]/20 to-transparent'}`}>
                  <div className="flex justify-between items-start">
                    <div className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${selectedThreatNode.isRed ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/30' : 'bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/30'}`}>
                      {selectedThreatNode.isRed ? 'CRITICAL ALERT' : 'WARNING'}
                    </div>
                    <Dialog.Close asChild>
                      <button className="text-gray-400 hover:text-white transition-colors p-1"><X size={20}/></button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Title className="text-xl font-black text-white leading-tight mt-1">{selectedThreatNode.title}</Dialog.Title>
                </div>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar text-white">
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Localized Sector</span>
                      <div className="text-sm font-semibold">{selectedThreatNode.zone}</div>
                    </div>
                    
                    <div>
                      <span className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Contributing Causes</span>
                      <div className="text-sm text-gray-300 leading-snug bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                        {selectedThreatNode.cause}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#142035] border border-white/5 rounded-xl p-4">
                        <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Risk Index</span>
                        <div className="text-lg font-black text-[#FF3B30]">{selectedThreatNode.riskIndex || 85}%</div>
                      </div>
                      <div className="bg-[#142035] border border-white/5 rounded-xl p-4">
                        <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Affected Pop.</span>
                        <div className="text-lg font-black text-orange-400">{selectedThreatNode.pop}</div>
                      </div>
                    </div>

                    {/* SHAP Data Distribution Widget */}
                    {currentSnapshot?.shapData && (
                      <div className="bg-[#142035] border border-white/5 rounded-xl p-4 shadow-inner">
                        <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">AI Threat Factor Analysis (SHAP)</span>
                        <div className="space-y-3">
                          {currentSnapshot.shapData.map((feature: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-gray-300">{feature.factor}</span>
                                <span className="text-[11px] font-black" style={{ color: feature.color }}>{feature.value}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${feature.value}%`, backgroundColor: feature.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 mt-6 border-t border-white/10">
                    <button className="w-full bg-[#34C759] hover:bg-[#2db34f] text-[#0A192F] font-black uppercase tracking-widest text-[11px] py-4 rounded-xl shadow-[0_0_20px_rgba(52,199,89,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer">
                      Push Route Telemetry to Mobile App
                      <svg viewBox="0 0 24 24" className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
