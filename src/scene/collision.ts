import {
  APARTMENT_BOUNDS,
  FURNITURE_COLLIDERS,
  PLAYER_RADIUS,
  WALL_SEGMENTS,
} from './apartmentData';

interface Segment2D {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  halfThick: number;
}

const WALL_COLLIDERS: Segment2D[] = WALL_SEGMENTS.filter((w) => w.collidable).map((w) => ({
  x1: w.x1,
  z1: w.z1,
  x2: w.x2,
  z2: w.z2,
  halfThick: Math.max(0.04, w.thickness * 0.5),
}));

// Push circle (px, pz, r) out of segment (x1, z1)-(x2, z2) with thickness
function resolveSegment(
  pos: { x: number; z: number },
  r: number,
  seg: Segment2D
) {
  const vx = seg.x2 - seg.x1;
  const vz = seg.z2 - seg.z1;
  const lenSq = vx * vx + vz * vz;
  if (lenSq < 1e-6) return;

  const wx = pos.x - seg.x1;
  const wz = pos.z - seg.z1;
  const t = Math.max(0, Math.min(1, (wx * vx + wz * vz) / lenSq));
  const cx = seg.x1 + t * vx;
  const cz = seg.z1 + t * vz;

  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const distSq = dx * dx + dz * dz;
  const minDist = r + seg.halfThick;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq);
    if (dist > 1e-5) {
      const push = minDist - dist;
      pos.x += (dx / dist) * push;
      pos.z += (dz / dist) * push;
    } else {
      pos.z += minDist;
    }
  }
}

// Push circle out of AABB box
function resolveBox(
  pos: { x: number; z: number },
  r: number,
  box: { minX: number; maxX: number; minZ: number; maxZ: number }
) {
  const closestX = Math.max(box.minX, Math.min(pos.x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));

  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq < r * r) {
    const dist = Math.sqrt(distSq);
    if (dist > 1e-5) {
      const push = r - dist;
      pos.x += (dx / dist) * push;
      pos.z += (dz / dist) * push;
    } else {
      // Inside box: push out nearest edge
      const leftPen = Math.abs(pos.x - box.minX);
      const rightPen = Math.abs(box.maxX - pos.x);
      const topPen = Math.abs(pos.z - box.minZ);
      const botPen = Math.abs(box.maxZ - pos.z);
      const m = Math.min(leftPen, rightPen, topPen, botPen);
      if (m === leftPen) pos.x = box.minX - r;
      else if (m === rightPen) pos.x = box.maxX + r;
      else if (m === topPen) pos.z = box.minZ - r;
      else pos.z = box.maxZ + r;
    }
  }
}

export function resolvePlayerCollision(pos: { x: number; z: number }) {
  const r = PLAYER_RADIUS;

  // Iterative resolution for clean corner sliding
  for (let pass = 0; pass < 3; pass++) {
    // 1. Apartment outer perimeter clamp
    if (pos.x < APARTMENT_BOUNDS.minX + r) pos.x = APARTMENT_BOUNDS.minX + r;
    if (pos.x > APARTMENT_BOUNDS.maxX - r) pos.x = APARTMENT_BOUNDS.maxX - r;
    if (pos.z < APARTMENT_BOUNDS.minZ + r) pos.z = APARTMENT_BOUNDS.minZ + r;
    if (pos.z > APARTMENT_BOUNDS.maxZ - r) pos.z = APARTMENT_BOUNDS.maxZ - r;

    // 2. Curved top-left balcony railing perimeter ellipse centered at (-4.05, -1.5)
    if (pos.x < -4.05 && pos.z < -1.5) {
      const ex = (pos.x + 4.05) / (2.1 - r);
      const ez = (pos.z + 1.5) / (2.26 - r);
      const eDist = Math.hypot(ex, ez);
      if (eDist > 1.0) {
        pos.x = -4.05 + (ex / eDist) * (2.1 - r);
        pos.z = -1.5 + (ez / eDist) * (2.26 - r);
      }
    }

    // 3. Walls & glass dividers
    for (let i = 0; i < WALL_COLLIDERS.length; i++) {
      resolveSegment(pos, r, WALL_COLLIDERS[i]);
    }

    // 4. Furniture solid bounds
    for (let i = 0; i < FURNITURE_COLLIDERS.length; i++) {
      resolveBox(pos, r, FURNITURE_COLLIDERS[i]);
    }
  }
}
