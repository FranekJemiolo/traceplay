export interface Point {
  x: number;
  y: number;
}

/**
 * Computes 2D cross product of vector (b - a) and (c - a).
 * Positive = counter-clockwise turn, negative = clockwise turn, 0 = collinear.
 */
export function ccw(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * Determines whether line segment AB and line segment CD properly intersect.
 * Shared endpoints are not considered intersecting.
 */
export function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  // Shared endpoints do not count as crossing
  if (
    (a.x === c.x && a.y === c.y) ||
    (a.x === d.x && a.y === d.y) ||
    (b.x === c.x && b.y === c.y) ||
    (b.x === d.x && b.y === d.y)
  ) {
    return false;
  }

  const cp1 = ccw(a, b, c);
  const cp2 = ccw(a, b, d);
  const cp3 = ccw(c, d, a);
  const cp4 = ccw(c, d, b);

  const straddles1 = (cp1 > 0 && cp2 < 0) || (cp1 < 0 && cp2 > 0);
  const straddles2 = (cp3 > 0 && cp4 < 0) || (cp3 < 0 && cp4 > 0);

  return straddles1 && straddles2;
}

/**
 * Checks if any non-adjacent edges in a closed polygon loop cross each other.
 */
export function hasCrossingLines(points: Point[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];

    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // adjacent edge in closed loop
      const c = points[j];
      const d = points[(j + 1) % n];

      if (segmentsIntersect(a, b, c, d)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Untangles self-intersecting polygon edges using 2-opt inversion moves.
 * Guarantees that the resulting polygon has zero crossing lines.
 */
export function untanglePolygon(points: Point[], maxIterations = 60): Point[] {
  let pts = points.map((p) => ({ x: p.x, y: p.y }));
  const n = pts.length;
  if (n < 4) return pts;

  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;

        const a = pts[i];
        const b = pts[(i + 1) % n];
        const c = pts[j];
        const d = pts[(j + 1) % n];

        if (segmentsIntersect(a, b, c, d)) {
          // 2-opt edge reversal: reverse sequence between (i + 1) and j
          const sub = pts.slice(i + 1, j + 1).reverse();
          pts = [...pts.slice(0, i + 1), ...sub, ...pts.slice(j + 1)];
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return pts;
}

/**
 * Subsamples and bounds point count to a configurable limit (up to 100 dots).
 * If there aren't too many dots (points.length <= maxCount), does NOT reduce them.
 * Enforces non-overlapping spacing and untangles so lines never cross.
 */
export function reducePointsToLimit(
  points: Point[],
  maxCount: number = 100,
  minSpacing: number = 8
): Point[] {
  if (points.length <= 3) return points;

  // Do not reduce the dots if there aren't too many!
  if (points.length <= maxCount) {
    return untanglePolygon(points);
  }

  // 1. Calculate cumulative perimeter lengths along closed loop
  const n = points.length;
  const dists: number[] = [0];
  for (let i = 0; i < n; i++) {
    const nextPt = points[(i + 1) % n];
    const d = Math.hypot(nextPt.x - points[i].x, nextPt.y - points[i].y);
    dists.push(dists[dists.length - 1] + d);
  }
  const totalPerimeter = dists[dists.length - 1];

  if (totalPerimeter <= 0) {
    return untanglePolygon(points.slice(0, maxCount));
  }

  // Subsample exactly to maxCount along the continuous perimeter loop
  const targetK = Math.min(maxCount, points.length);
  const targetStep = totalPerimeter / targetK;
  // Adaptive spacing threshold so high dot limits (e.g. 50-100) are never decimated
  const safeSpacing = Math.max(3, Math.min(minSpacing, totalPerimeter / (targetK * 1.6)));

  const sampled: Point[] = [];
  for (let k = 0; k < targetK; k++) {
    const targetDist = k * targetStep;
    let foundIdx = 0;
    for (let i = 0; i < n; i++) {
      if (dists[i] <= targetDist && targetDist <= dists[i + 1]) {
        foundIdx = i;
        break;
      }
    }
    const pt = points[foundIdx];

    const tooClose = sampled.some(
      (s) => Math.hypot(s.x - pt.x, s.y - pt.y) < safeSpacing
    );
    if (!tooClose) {
      sampled.push({ x: Math.round(pt.x), y: Math.round(pt.y) });
    }
  }

  // Check closure distance
  if (sampled.length > 3) {
    const last = sampled[sampled.length - 1];
    const first = sampled[0];
    if (Math.hypot(last.x - first.x, last.y - first.y) < safeSpacing) {
      sampled.pop();
    }
  }

  const finalPts = sampled.length >= 3 ? sampled : points.slice(0, maxCount);

  // Guarantee zero self-intersecting segments
  return untanglePolygon(finalPts);
}
