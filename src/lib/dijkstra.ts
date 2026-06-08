/**
 * Type definitions for the SIERA evacuation routing graph.
 */

/**
 * Represents a node in the evacuation routing graph.
 */
export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

/**
 * Represents an edge connecting two nodes in the graph.
 */
export interface Edge {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  blocked: boolean;
}

/**
 * Represents the graph structure containing nodes and edges.
 */
export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Result of the shortest path calculation.
 */
export interface ShortestPathResult {
  path: string[];
  distance: number;
  safeZoneId: string;
  found: boolean;
}

/**
 * Builds an adjacency list from the graph edges.
 * @param edges - Array of edges to process
 * @param blockedEdgeIds - Array of edge IDs to exclude
 * @returns Map of node IDs to their connected edges
 */
function buildAdjacencyList(
  edges: Edge[],
  blockedEdgeIds: string[]
): Map<string, Edge[]> {
  const adjacency = new Map<string, Edge[]>();
  const blockedSet = new Set(blockedEdgeIds);

  for (const edge of edges) {
    if (edge.blocked || blockedSet.has(edge.id)) {
      continue;
    }
    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, []);
    }
    adjacency.get(edge.from)!.push(edge);
  }

  return adjacency;
}

/**
 * Finds the shortest path from a start node to any of the specified safe zones
 * using Dijkstra's algorithm.
 *
 * @param graph - The graph containing nodes and edges for the evacuation routing system
 * @param startNodeId - The ID of the starting node (citizen's current location)
 * @param safeZoneIds - Array of safe zone node IDs to search for the nearest evacuation center
 * @param blockedEdgeIds - Array of edge IDs that should be excluded from routing (blocked roads)
 * @returns ShortestPathResult object containing:
 *   - path: Array of node IDs representing the route (empty if no path found)
 *   - distance: Total distance in meters (0 if no path found)
 *   - safeZoneId: The ID of the reached safe zone (empty string if no path found)
 *   - found: Boolean indicating whether a valid path was found
 */
export function findShortestPathToSafeZone(
  graph: Graph,
  startNodeId: string,
  safeZoneIds: string[],
  blockedEdgeIds: string[]
): ShortestPathResult {
  const adjacency = buildAdjacencyList(graph.edges, blockedEdgeIds);
  const safeZoneSet = new Set(safeZoneIds);

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  distances.set(startNodeId, 0);

  const unvisited = new Set<string>(graph.nodes.map((n) => n.id));

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    }

    if (current === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(current);
    visited.add(current);

    const neighbors = adjacency.get(current) || [];
    for (const edge of neighbors) {
      const neighbor = edge.to;
      if (visited.has(neighbor)) {
        continue;
      }

      const newDistance = minDistance + edge.distance;
      if (newDistance < distances.get(neighbor)!) {
        distances.set(neighbor, newDistance);
        previous.set(neighbor, current);
      }
    }
  }

  let closestSafeZone: string | null = null;
  let minDistance = Infinity;

  for (const safeZoneId of safeZoneIds) {
    const dist = distances.get(safeZoneId);
    if (dist !== undefined && dist < minDistance && dist !== Infinity) {
      minDistance = dist;
      closestSafeZone = safeZoneId;
    }
  }

  if (closestSafeZone === null) {
    return {
      path: [],
      distance: 0,
      safeZoneId: '',
      found: false,
    };
  }

  const path: string[] = [];
  let current: string | null = closestSafeZone;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  if (path[0] !== startNodeId) {
    return {
      path: [],
      distance: 0,
      safeZoneId: '',
      found: false,
    };
  }

  return {
    path,
    distance: minDistance,
    safeZoneId: closestSafeZone,
    found: true,
  };
}

/**
 * Extracts coordinate pairs for a route path suitable for Leaflet map rendering.
 *
 * @param path - Array of node IDs representing the route
 * @param nodes - Array of all nodes in the graph to look up coordinates
 * @returns Array of [lat, lng] coordinate pairs for each node in the path,
 *          in the same order as the input path
 */
export function getRouteCoordinates(
  path: string[],
  nodes: Node[]
): [number, number][] {
  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return path
    .map((nodeId) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        return [node.lat, node.lng] as [number, number];
      }
      return null;
    })
    .filter((coord): coord is [number, number] => coord !== null);
}

/**
 * Calculates the total distance of a route path by summing edge distances.
 *
 * @param path - Array of node IDs representing the route
 * @param edges - Array of all edges in the graph to look up distances
 * @returns Total distance in meters of the route. Returns 0 if the path
 *          has fewer than 2 nodes or if any consecutive nodes are not connected.
 */
export function getRouteDistance(path: string[], edges: Edge[]): number {
  if (path.length < 2) {
    return 0;
  }

  const edgeMap = new Map<string, number>();
  for (const edge of edges) {
    const key = `${edge.from}->${edge.to}`;
    edgeMap.set(key, edge.distance);
  }

  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const key = `${from}->${to}`;
    const distance = edgeMap.get(key);

    if (distance === undefined) {
      return 0;
    }

    totalDistance += distance;
  }

  return totalDistance;
}