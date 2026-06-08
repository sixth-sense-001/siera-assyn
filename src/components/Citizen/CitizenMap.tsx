'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Map, { Marker } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { PathLayer, PolygonLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import { findShortestPathToSafeZone, getRouteCoordinates, Graph } from '@/lib/dijkstra';
import { useDashboardStore } from '@/store/dashboardStore';
import graphData from '@/data/nyabihu-graph.json';
import timelineData from '@/data/scenario-timeline.json';

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
    {
      id: 'satellite',
      type: 'raster',
      source: 'esri-satellite'
    },
    {
      id: 'reference',
      type: 'raster',
      source: 'esri-reference'
    },
    {
      id: 'transportation',
      type: 'raster',
      source: 'esri-transportation'
    }
  ]
};

const SafeCenterPin = () => (
  <div style={{ transform: 'translate(-50%, -100%)', marginTop: '-15px' }}>
    <div className="bg-gradient-to-r from-emerald-600 to-green-500 border border-green-400 px-3 py-1.5 rounded-lg shadow-xl shadow-green-500/20 text-white flex items-center gap-2 whitespace-nowrap">
      <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-black tracking-wider uppercase leading-none text-emerald-200">Safe Evacuation Center</span>
        <span className="text-[10px] font-black leading-tight mt-0.5">Murambi Community Center</span>
      </div>
    </div>
    <div className="w-3 h-3 bg-green-500 rotate-45 mx-auto -mt-1.5 border-r border-b border-green-400"></div>
  </div>
);

const CitizenYouPin = () => (
  <div style={{ transform: 'translate(-50%, -100%)', marginTop: '-10px' }} className="flex flex-col items-center">
    <div className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded border border-blue-400 shadow-md uppercase tracking-wider leading-none mb-1">
      YOU
    </div>
    <div className="relative flex items-center justify-center">
      <div className="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-ping"></div>
      <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-blue-500/50">
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    </div>
  </div>
);

const BarricadePin = () => (
  <div className="relative flex flex-col items-center select-none" style={{ transform: 'translate(-50%, -100%)' }}>
    <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-red-600/40 z-10 animate-bounce">
      <span className="text-[10px] font-black text-white leading-none">!</span>
    </div>
    <div className="w-8 h-4 bg-amber-800/90 border border-amber-600 rounded mt-0.5 flex flex-col justify-between p-0.5">
      <div className="w-full h-1 bg-red-500 border border-white/50 skew-x-6"></div>
      <div className="w-full h-1 bg-red-500 border border-white/50 -skew-x-6"></div>
    </div>
  </div>
);

export default function CitizenMap() {
  const { role, login, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && role !== 'citizen') {
      login('citizen');
    }
  }, [isLoading, role, login]);

  const { currentSnapshotIndex, addCitizenReport } = useDashboardStore();
  const snapshot = timelineData.snapshots[currentSnapshotIndex]; 
  const blockedEdges = snapshot.blockedEdges || [];

  const getNodePosition = (id: string): [number, number] | null => {
    const node = graphData.nodes.find((n: any) => n.id === id);
    // Return [lng, lat] for MapLibre/DeckGL
    return node ? [node.lng, node.lat] : null;
  };

  const safeZoneNodes = graphData.nodes.filter((n: any) => n.type === 'safe_zone');
  const safeZoneIds = safeZoneNodes.map((n: any) => n.id);

  const dijkstraResult = findShortestPathToSafeZone(
    graphData as unknown as Graph,
    'citizen_start',
    safeZoneIds,
    blockedEdges
  );

  // Convert Route Coords to [lng, lat]
  let safeRouteCoords: [number, number][] = [];
  if (dijkstraResult.found) {
    const leafletCoords = getRouteCoordinates(dijkstraResult.path, graphData.nodes as any[]);
    safeRouteCoords = leafletCoords.map(c => [c[1], c[0]]);
  }

  const startCoord = getNodePosition('citizen_start') || [29.5200, -1.5900];
  const safeZoneCoord = getNodePosition('safe_zone_2') || [29.5400, -1.5720];

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020813]">
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-sm">Loading Citizen Portal...</div>
        </div>
      </div>
    );
  }

  const deckLayers = [
    new PolygonLayer({
      id: 'flood-polygon-mobile',
      data: snapshot.floodZones || [],
      getPolygon: (d: any) => d.polygonContours,
      getFillColor: [220, 38, 38, 90], // #dc2626
      getLineColor: [220, 38, 38, 255],
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      updateTriggers: {
        data: [currentSnapshotIndex]
      }
    }),
    ...(safeRouteCoords.length > 0 ? [
      new PathLayer({
        id: 'safe-route-glow',
        data: [{ path: safeRouteCoords }],
        getPath: d => d.path,
        getColor: [0, 230, 118, 200], // #00e676 glow
        getWidth: 12,
        widthUnits: 'pixels',
        capRounded: true,
        jointRounded: true,
      }),
      new PathLayer({
        id: 'safe-route-core',
        data: [{ path: safeRouteCoords }],
        getPath: d => d.path,
        getColor: [255, 255, 255, 255],
        getWidth: 4,
        widthUnits: 'pixels',
        capRounded: true,
        jointRounded: true,
      })
    ] : [])
  ];

  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center bg-[#020813] px-4 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none" />

      <div className="text-center mb-6 z-10 select-none">
        <h2 className="text-xl font-bold text-white tracking-wide">SIERA Mobile Companion</h2>
        <p className="text-xs text-slate-400 mt-1">Real-time citizen safety assistance & dynamic path finding</p>
      </div>

      <div className="smartphone-container z-10">
        <div className="smartphone-speaker"></div>
        <div className="smartphone-notch"></div>
        
        <div className="smartphone-screen relative">
          
          <div className="w-full h-full relative">
            <Map
              initialViewState={{
                longitude: 29.530,
                latitude: -1.579,
                zoom: 14,
                pitch: 45
              }}
              mapStyle={mapStyle}
              style={{ width: '100%', height: '100%', filter: 'grayscale(20%)' }}
            >
              <DeckGL 
                initialViewState={{
                  longitude: 29.530,
                  latitude: -1.579,
                  zoom: 14,
                  pitch: 45
                }}
                controller={true}
                layers={deckLayers}
              />

              <Marker longitude={29.528} latitude={-1.595} anchor="center">
                <div className="flex items-center gap-1 bg-red-600/90 text-white font-extrabold px-2 py-0.5 rounded text-[8px] uppercase border border-red-400 select-none shadow-lg">⚠️ Flood Zone</div>
              </Marker>
              
              <Marker longitude={29.516} latitude={-1.585} anchor="center">
                <div className="flex items-center gap-1 bg-orange-600/90 text-white font-extrabold px-2 py-0.5 rounded text-[8px] uppercase border border-orange-400 select-none shadow-lg">⚠️ Landslide Alert</div>
              </Marker>

              <Marker longitude={29.516} latitude={-1.585} anchor="center">
                <BarricadePin />
              </Marker>
              <Marker longitude={29.525} latitude={-1.587} anchor="center">
                <BarricadePin />
              </Marker>

              <Marker longitude={startCoord[0]} latitude={startCoord[1]} anchor="center">
                <CitizenYouPin />
              </Marker>

              <Marker longitude={safeZoneCoord[0]} latitude={safeZoneCoord[1]} anchor="center">
                <SafeCenterPin />
              </Marker>
            </Map>

            <div className="absolute top-3 left-4 right-4 z-[1000] flex justify-between items-center pointer-events-none select-none">
              <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg text-white font-black text-[13px] tracking-wide pointer-events-auto">
                Evacuation Map
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center text-white text-xs">
                  🧭
                </div>
                <div className="flex items-center gap-1.5 bg-red-600/90 border border-red-500 rounded-lg px-2.5 py-1 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span className="text-[9px] font-black text-white tracking-widest uppercase">Live</span>
                </div>
              </div>
            </div>

            {/* Rerouting State / Route Info */}
            {dijkstraResult.found ? (
              <div className="absolute top-16 left-4 z-[1000] glass-panel rounded-2xl border border-white/10 shadow-2xl px-4 py-2.5 flex items-center gap-3.5 text-white select-none pointer-events-auto transition-colors">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-sm">
                  🏃‍♂️
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-bold text-gray-400 tracking-wider uppercase leading-none">Route to Safe Center</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm font-black leading-none">{dijkstraResult.distance} m</span>
                    <span className="text-[10px] text-green-400 font-extrabold leading-none">· Safe</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute top-16 left-4 right-4 z-[1000] glass-panel rounded-2xl border border-red-500/50 bg-[#dc2626]/20 shadow-2xl px-4 py-3 flex items-center gap-3.5 text-white select-none pointer-events-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 text-sm animate-spin-slow">
                  ⚠️
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-red-400 tracking-widest uppercase leading-none">Route Blocked</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-black leading-none">Recalculating...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-16 right-4 z-[1000] glass-panel w-56 rounded-2xl border border-l-4 border-l-red-500 border-white/10 shadow-2xl p-3 text-white select-none pointer-events-auto">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-red-500 text-xs font-bold">⚠️</span>
                <span className="text-[8.5px] font-black tracking-widest text-slate-100 uppercase">Emergency Broadcast</span>
              </div>
              <p className="text-[9px] font-bold text-slate-200 leading-snug">
                Heavy Rainfall and Flooding in Progress. Avoid flooded areas and follow the safe route.
              </p>
              <div className="text-[9.5px] font-black text-emerald-400 mt-2">
                Stay safe!
              </div>
            </div>

            <div className="absolute bottom-16 left-4 z-[1000] glass-panel w-40 rounded-xl border border-white/5 shadow-2xl p-2.5 text-[7.5px] text-gray-400 font-bold space-y-1.5 select-none pointer-events-none">
              <div className="text-white text-[8px] font-black border-b border-white/5 pb-1 mb-1 tracking-wider uppercase">Map Legend</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-green-500"></div><span className="text-slate-300">Evacuation Center</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-300">Your Location</span></div>
              <div className="flex items-center gap-2"><div className="w-3.5 h-0.5 bg-green-400"></div><span className="text-slate-300">Safe Route</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-red-600/30 border border-red-600"></div><span className="text-slate-300">Flood Zone</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-orange-600/30 border border-orange-600"></div><span className="text-slate-300">Landslide Zone</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-amber-800 border border-red-500 flex items-center justify-center text-[5px] font-black text-white leading-none">!</div><span className="text-slate-300">Road Blocked</span></div>
            </div>

            <div className="absolute bottom-3 left-4 right-4 z-[1000] h-11 flex gap-3 select-none pointer-events-auto">
              <button className="flex-1 h-full rounded-xl bg-[#007A87] hover:bg-[#0099B3] text-white flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-colors duration-200 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2L2 22l10-6 10 6L12 2z" /></svg>
                <span className="text-xs font-black tracking-widest uppercase">Navigate</span>
              </button>
              <button onClick={() => {
                addCitizenReport({
                  id: `report-${Date.now()}`,
                  coordinates: startCoord,
                  type: 'blocked_road',
                  timestamp: Date.now()
                });
                alert("Report sent to emergency response team.");
              }} className="flex-1 h-full rounded-xl bg-[#d87a1c] hover:bg-[#e68a2a] text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-colors duration-200 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <span className="text-xs font-black tracking-widest uppercase">Report</span>
              </button>
              <button className="flex-1 h-full rounded-xl bg-[#142035] hover:bg-[#1f304f] text-slate-200 hover:text-white flex items-center justify-center gap-2 shadow-lg transition-colors duration-200 border border-white/5 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className="text-xs font-black tracking-widest uppercase">Safe Zones</span>
              </button>
            </div>

          </div>
          <div className="smartphone-home-indicator"></div>
        </div>
      </div>
      <button onClick={() => router.push('/')} className="mt-6 text-xs font-semibold text-teal-400 hover:text-white transition-colors cursor-pointer z-10 relative">
        ← Back to System Portal
      </button>
    </div>
  );
}
