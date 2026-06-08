import { create } from 'zustand';

interface ThreatNode {
  title: string;
  zone: string;
  cause: string;
  type: string;
  pop: number;
  isRed: boolean;
  riskIndex?: number;
}

export interface CitizenReport {
  id: string;
  coordinates: [number, number];
  type: 'blocked_road' | 'flood' | 'landslide';
  timestamp: number;
}

interface DashboardState {
  currentSnapshotIndex: number;
  activeLayerToggles: {
    vegetation: boolean;
    slope: boolean;
    drainage: boolean;
    heatmap: boolean;
  };
  selectedThreatNode: ThreatNode | null;
  playbackStatus: 'playing' | 'paused';
  citizenReports: CitizenReport[];
  
  setCurrentSnapshotIndex: (index: number) => void;
  toggleLayer: (layer: keyof DashboardState['activeLayerToggles']) => void;
  setSelectedThreatNode: (node: ThreatNode | null) => void;
  setPlaybackStatus: (status: 'playing' | 'paused') => void;
  addCitizenReport: (report: CitizenReport) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  currentSnapshotIndex: 0,
  activeLayerToggles: {
    vegetation: false,
    slope: false,
    drainage: false,
    heatmap: true, // Default to heatmap active
  },
  selectedThreatNode: null,
  playbackStatus: 'paused',
  citizenReports: [],

  setCurrentSnapshotIndex: (index) => set({ currentSnapshotIndex: index }),
  toggleLayer: (layer) => set((state) => ({
    activeLayerToggles: {
      ...state.activeLayerToggles,
      [layer]: !state.activeLayerToggles[layer]
    }
  })),
  setSelectedThreatNode: (node) => set({ selectedThreatNode: node }),
  setPlaybackStatus: (status) => set({ playbackStatus: status }),
  addCitizenReport: (report) => set((state) => ({ citizenReports: [...state.citizenReports, report] })),
}));
