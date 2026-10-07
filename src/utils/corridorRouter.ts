export interface Point2D {
  x: number;
  z: number;
  description?: string;
}

interface CorridorSegment {
  p1: { x: number; z: number };
  p2: { x: number; z: number };
  type: 'horizontal' | 'vertical';
}

// Actual 3D Factory Corridor Network Segments (Without phantom wall corridors)
const CORRIDOR_SEGMENTS: CorridorSegment[] = [
  // 1. Horizontal Aisles (East-West)
  { p1: { x: -44.0, z: -7.0 }, p2: { x: 44.0, z: -7.0 }, type: 'horizontal' }, // North Cross Aisle (in front of M01-M05)
  { p1: { x: -44.0, z: 9.0 }, p2: { x: 44.0, z: 9.0 }, type: 'horizontal' },   // South Cross Aisle (in front of M06-M11)
  { p1: { x: 0, z: 32.0 }, p2: { x: 21.0, z: 32.0 }, type: 'horizontal' },     // South Connector Aisle

  // 2. Vertical Aisles (North-South)
  { p1: { x: 0, z: -32.0 }, p2: { x: 0, z: 32.0 }, type: 'vertical' },         // Central Main Aisle
  { p1: { x: -23.0, z: -7.0 }, p2: { x: -23.0, z: 9.0 }, type: 'vertical' },   // Aisle between Rosca & Zincagem
  { p1: { x: 21.0, z: 9.0 }, p2: { x: 21.0, z: 32.0 }, type: 'vertical' }      // Aisle between Bihler & Embalagem
];

// Major Corridor Intersections
const JUNCTIONS: Point2D[] = [
  { x: 0, z: -7.0 },    // Central Aisle x North Cross
  { x: 0, z: 9.0 },     // Central Aisle x South Cross
  { x: 0, z: 32.0 },    // Central Aisle x South Connector
  { x: 0, z: -32.0 },   // Central Aisle North Terminal

  { x: -23.0, z: -7.0 }, // West Aisle x North Cross
  { x: -23.0, z: 9.0 },  // West Aisle x South Cross

  { x: 21.0, z: 9.0 },   // East Aisle x South Cross
  { x: 21.0, z: 32.0 },  // East Aisle x South Connector

  { x: -44.0, z: -7.0 }, // North Cross West End
  { x: 44.0, z: -7.0 },  // North Cross East End
  { x: -44.0, z: 9.0 },  // South Cross West End
  { x: 44.0, z: 9.0 }    // South Cross East End
];

// Project a point onto a corridor segment
function projectPointToSegment(
  p: { x: number; z: number },
  seg: CorridorSegment
): { x: number; z: number; distSq: number } {
  if (seg.type === 'horizontal') {
    const minX = Math.min(seg.p1.x, seg.p2.x);
    const maxX = Math.max(seg.p1.x, seg.p2.x);
    const clampedX = Math.max(minX, Math.min(maxX, p.x));
    const z = seg.p1.z;
    const dx = p.x - clampedX;
    const dz = p.z - z;
    return { x: clampedX, z, distSq: dx * dx + dz * dz };
  } else {
    const minZ = Math.min(seg.p1.z, seg.p2.z);
    const maxZ = Math.max(seg.p1.z, seg.p2.z);
    const clampedZ = Math.max(minZ, Math.min(maxZ, p.z));
    const x = seg.p1.x;
    const dx = p.x - x;
    const dz = p.z - clampedZ;
    return { x, z: clampedZ, distSq: dx * dx + dz * dz };
  }
}

// Find closest point on corridor network
export function getClosestCorridorPoint(p: { x: number; z: number }): { x: number; z: number } {
  let bestPoint = { x: 0, z: p.z };
  let bestDistSq = Infinity;

  for (const seg of CORRIDOR_SEGMENTS) {
    const proj = projectPointToSegment(p, seg);
    if (proj.distSq < bestDistSq) {
      bestDistSq = proj.distSq;
      bestPoint = { x: proj.x, z: proj.z };
    }
  }

  return bestPoint;
}

// Check if two points on the corridor network can be connected via a straight corridor segment
function canConnectDirectlyOnCorridor(p1: { x: number; z: number }, p2: { x: number; z: number }): boolean {
  const eps = 0.05;
  // Same horizontal corridor
  if (Math.abs(p1.z - p2.z) < eps) {
    for (const seg of CORRIDOR_SEGMENTS) {
      if (seg.type === 'horizontal' && Math.abs(seg.p1.z - p1.z) < eps) {
        const minX = Math.min(seg.p1.x, seg.p2.x) - eps;
        const maxX = Math.max(seg.p1.x, seg.p2.x) + eps;
        if (p1.x >= minX && p1.x <= maxX && p2.x >= minX && p2.x <= maxX) {
          return true;
        }
      }
    }
  }

  // Same vertical corridor
  if (Math.abs(p1.x - p2.x) < eps) {
    for (const seg of CORRIDOR_SEGMENTS) {
      if (seg.type === 'vertical' && Math.abs(seg.p1.x - p1.x) < eps) {
        const minZ = Math.min(seg.p1.z, seg.p2.z) - eps;
        const maxZ = Math.max(seg.p1.z, seg.p2.z) + eps;
        if (p1.z >= minZ && p1.z <= maxZ && p2.z >= minZ && p2.z <= maxZ) {
          return true;
        }
      }
    }
  }

  return false;
}

// Compute the exact inspection waypoint strictly ON THE CORRIDOR facing the machine
export function getMachineCorridorInspectionPoint(destination: { x: number; z: number }): Point2D {
  // 1. Northern Machines (M01, M02, M03, M04, M05 at Z ≈ -20.4)
  // Corridor in front is North Cross Aisle at Z = -7.0
  if (destination.z <= -2.0) {
    return {
      x: Math.max(-44.0, Math.min(44.0, destination.x)),
      z: -7.0
    };
  }

  // 2. Central Sector Machines (M06, M07, M08, M09, M10, M11 at Z ≈ 1.0)
  if (destination.z > -2.0 && destination.z <= 8.0) {
    // If closer to North Cross Aisle
    if (destination.z <= 0) {
      return {
        x: Math.max(-44.0, Math.min(44.0, destination.x)),
        z: -7.0
      };
    } else {
      // Closer to South Cross Aisle at Z = 9.0
      return {
        x: Math.max(-44.0, Math.min(44.0, destination.x)),
        z: 9.0
      };
    }
  }

  // 3. Southern Sector Machines (M12, M13, M14, M15, M16 at Z > 8.0)
  // Ferramentaria on West side
  if (destination.x <= -1.0) {
    return {
      x: Math.max(-44.0, Math.min(-2.0, destination.x)),
      z: 9.0
    };
  }

  // Bihler and Embalagem on East side -> Corridor at X = 21.0
  if (destination.x > 1.0) {
    return {
      x: 21.0,
      z: Math.max(9.0, Math.min(32.0, destination.z))
    };
  }

  // Fallback closest corridor
  return getClosestCorridorPoint(destination);
}

// Dijkstra shortest path along the corridor network
export function calculateCorridorPath(
  start: { x: number; z: number },
  destination: { x: number; z: number },
  isMachineDestination: boolean = false
): Point2D[] {
  const startCorridor = getClosestCorridorPoint(start);

  // If destination is a machine, place destination STRICTLY on the corridor facing the machine
  const targetCorridorPoint = isMachineDestination
    ? getMachineCorridorInspectionPoint(destination)
    : getClosestCorridorPoint(destination);

  const finalDestination = targetCorridorPoint;

  // If start and dest are directly on the same corridor
  if (canConnectDirectlyOnCorridor(startCorridor, targetCorridorPoint)) {
    const rawWaypoints = [
      { x: start.x, z: start.z },
      { x: startCorridor.x, z: startCorridor.z },
      { x: targetCorridorPoint.x, z: targetCorridorPoint.z }
    ];
    return cleanWaypoints(rawWaypoints);
  }

  // Build temporary graph with junctions + startCorridor + targetCorridorPoint
  const allNodes: Point2D[] = [...JUNCTIONS];

  const findExisting = (p: Point2D) =>
    allNodes.findIndex((n) => Math.hypot(n.x - p.x, n.z - p.z) < 0.2);

  let startIndex = findExisting(startCorridor);
  if (startIndex === -1) {
    startIndex = allNodes.length;
    allNodes.push(startCorridor);
  }

  let destIndex = findExisting(targetCorridorPoint);
  if (destIndex === -1) {
    destIndex = allNodes.length;
    allNodes.push(targetCorridorPoint);
  }

  // Adjacency matrix
  const n = allNodes.length;
  const adj: Array<Array<{ node: number; dist: number }>> = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (canConnectDirectlyOnCorridor(allNodes[i], allNodes[j])) {
        const d = Math.hypot(allNodes[i].x - allNodes[j].x, allNodes[i].z - allNodes[j].z);
        adj[i].push({ node: j, dist: d });
        adj[j].push({ node: i, dist: d });
      }
    }
  }

  // Dijkstra
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);

  dist[startIndex] = 0;

  for (let step = 0; step < n; step++) {
    let u = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }

    if (u === -1 || u === destIndex) break;
    visited[u] = true;

    for (const edge of adj[u]) {
      const v = edge.node;
      if (!visited[v] && dist[u] + edge.dist < dist[v]) {
        dist[v] = dist[u] + edge.dist;
        prev[v] = u;
      }
    }
  }

  // Reconstruct path
  const pathIndices: number[] = [];
  let curr = destIndex;
  while (curr !== -1) {
    pathIndices.unshift(curr);
    curr = prev[curr];
  }

  const corridorWaypoints = pathIndices.map((idx) => allNodes[idx]);

  const rawPath: Point2D[] = [
    { x: start.x, z: start.z },
    ...corridorWaypoints,
    { x: finalDestination.x, z: finalDestination.z }
  ];

  return cleanWaypoints(rawPath);
}

// Clean and simplify waypoints (merge points that are too close or collinear)
function cleanWaypoints(points: Point2D[]): Point2D[] {
  if (points.length <= 1) return points;

  const result: Point2D[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const d = Math.hypot(curr.x - prev.x, curr.z - prev.z);

    if (d > 0.25) {
      result.push(curr);
    }
  }

  // Collinear reduction (eliminate middle point if 3 points are in a straight horizontal or vertical line)
  const simplified: Point2D[] = [];
  for (let i = 0; i < result.length; i++) {
    if (i === 0 || i === result.length - 1) {
      simplified.push(result[i]);
      continue;
    }

    const pPrev = result[i - 1];
    const pCurr = result[i];
    const pNext = result[i + 1];

    const isHorizontal = Math.abs(pPrev.z - pCurr.z) < 0.05 && Math.abs(pCurr.z - pNext.z) < 0.05;
    const isVertical = Math.abs(pPrev.x - pCurr.x) < 0.05 && Math.abs(pCurr.x - pNext.x) < 0.05;

    if (!isHorizontal && !isVertical) {
      simplified.push(pCurr);
    }
  }

  return simplified;
}
