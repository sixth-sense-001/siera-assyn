import timelineData from '@/data/scenario-timeline.json';

/**
 * Represents a single point-in-time snapshot within an emergency scenario timeline.
 * Each snapshot captures the state of a scenario at a specific moment for simulation
 * and training purposes.
 */
export type ScenarioSnapshot = {
  /** Unique identifier for this snapshot */
  id: string;
  /** Human-readable title describing the scenario situation */
  title: string;
  /** Unix timestamp (in seconds or milliseconds) indicating when this snapshot occurs */
  timestamp: number;
  /** Detailed description of the events or conditions at this snapshot */
  description: string;
  /** Risk level assessment from 0 (no risk) to a maximum value indicating severity */
  riskLevel: number;
  /** List of zone IDs that are affected by this scenario snapshot */
  affectedZones: string[];
  /** List of evacuation route IDs recommended for this scenario */
  evacuationRoutes: string[];
  /** Road IDs that are blocked at this snapshot */
  blockedRoadIds: string[];
  /** Statistics for affected populations and infrastructure */
  stats: {
    atRisk: number;
    evacuated: number;
    roadsBlocked: number;
    bridgesDown: number;
  };
  /** Alerts for zones at different risk levels */
  alerts: Array<{
    type: 'CRITICAL' | 'WARNING' | 'ELEVATED';
    zone: string;
    risk: number;
    cause: string;
    time: string;
  }>;
  /** Flood zones with geographic data */
  floodZones: {
    polygonContours: number[][];
    name: string;
  }[];
  /** Edge IDs that are blocked (same as blockedRoadIds) */
  blockedEdges: string[];
  /** Risk factor data with color coding */
  shapData: Array<{
    factor: string;
    value: number;
    color: string;
  }>;
  /** Citizen route information */
  citizenRoute: {
    name: string;
    distance: string;
    duration: string;
    status: 'safe' | 'blocked';
    updateMessage: string | null;
  };
  /** Meteo Rwanda warning text */
  meteoWarning?: string;
};

/**
 * Represents the complete timeline of a scenario containing all snapshots
 * in chronological order.
 */
export type ScenarioTimeline = {
  /** Array of scenario snapshots ordered by timestamp */
  snapshots: ScenarioSnapshot[];
};

const scenarioTimeline: ScenarioTimeline = timelineData as ScenarioTimeline;

/**
 * A React hook that provides access to scenario data based on the current snapshot index.
 * 
 * This hook retrieves a specific snapshot from the scenario timeline and determines
 * whether the system is in live mode (simulating real-time events).
 * 
 * @param currentSnapshotIndex - The zero-based index of the snapshot to retrieve from
 *                               the scenario timeline. Index 5 is treated as live mode.
 * 
 * @returns An object containing:
 *   - currentSnapshot: The ScenarioSnapshot at the specified index, or undefined if
 *                      the index is out of bounds
 *   - isLiveMode: Boolean indicating if the current index corresponds to live mode
 *                   (index === 5)
 * 
 * @example
 * ```tsx
 * const { currentSnapshot, isLiveMode } = useScenario(2);
 * // Returns snapshot at index 2 and isLiveMode = false
 * ```
 * 
 * @example
 * ```tsx
 * const { currentSnapshot, isLiveMode } = useScenario(5);
 * // Returns snapshot at index 5 and isLiveMode = true
 * ```
 */
export function useScenario(currentSnapshotIndex: number) {
  const currentSnapshot: ScenarioSnapshot | undefined =
    scenarioTimeline.snapshots[currentSnapshotIndex];

  const isLiveMode: boolean = currentSnapshotIndex === 5;

  return {
    currentSnapshot,
    isLiveMode,
  };
}
