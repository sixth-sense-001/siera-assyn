import { useState, useEffect, useCallback } from 'react';
import { database, ref, onValue, off, update } from '@/lib/firebase';

type FirebaseState = {
  currentSnapshotIndex: number;
  demoRunning: boolean;
  lastUpdated: number;
};

/**
 * A custom hook for managing Firebase real-time state synchronization.
 *
 * Subscribes to the 'siera-demo/state' path in Firebase Realtime Database
 * and provides reactive state updates along with loading and error handling.
 *
 * @returns An object containing:
 *   - state: The current Firebase state with snapshot index, demo status, and timestamp
 *   - loading: Boolean indicating if the initial data fetch is in progress
 *   - error: Error object if a Firebase error occurred, null otherwise
 *   - updateSnapshotIndex: Function to update the current snapshot index
 *   - setDemoRunning: Function to toggle the demo running state
 */
export function useFirebaseState() {
  const [state, setState] = useState<FirebaseState>({
    currentSnapshotIndex: 0,
    demoRunning: false,
    lastUpdated: Date.now(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const stateRef = ref(database, 'siera-demo/state');

    const listener = onValue(
      stateRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setState({
            currentSnapshotIndex: data.currentSnapshotIndex ?? 0,
            demoRunning: data.demoRunning ?? false,
            lastUpdated: data.lastUpdated ?? Date.now(),
          });
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      off(stateRef, 'value', listener);
    };
  }, []);

  const updateSnapshotIndex = useCallback(
    async (index: number) => {
      const stateRef = ref(database, 'siera-demo/state');
      await update(stateRef, {
        currentSnapshotIndex: index,
        lastUpdated: Date.now(),
      });
    },
    []
  );

  const setDemoRunning = useCallback(
    async (running: boolean) => {
      const stateRef = ref(database, 'siera-demo/state');
      await update(stateRef, {
        demoRunning: running,
        lastUpdated: Date.now(),
      });
    },
    []
  );

  return {
    state,
    loading,
    error,
    updateSnapshotIndex,
    setDemoRunning,
  };
}
