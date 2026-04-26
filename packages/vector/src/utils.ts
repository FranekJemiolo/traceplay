import { Point } from './types';

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);

  const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);

  const closestX = lineStart.x + u * dx;
  const closestY = lineStart.y + u * dy;

  return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
}

export function simplify(points: Point[], epsilon = 2): Point[] {
  if (points.length < 3) return points;

  const dmax = { dist: 0, index: 0 };

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > dmax.dist) {
      dmax.dist = d;
      dmax.index = i;
    }
  }

  if (dmax.dist > epsilon) {
    const rec1 = simplify(points.slice(0, dmax.index + 1), epsilon);
    const rec2 = simplify(points.slice(dmax.index), epsilon);
    return rec1.slice(0, -1).concat(rec2);
  }

  return [points[0], points[points.length - 1]];
}

export function toBezierSVG(points: Point[]): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;

    d += ` Q ${points[i].x} ${points[i].y}, ${midX} ${midY}`;
  }

  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

  return d;
}
