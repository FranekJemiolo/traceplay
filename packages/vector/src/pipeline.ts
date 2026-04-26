import cv from 'opencv.js';
import { Point, Shape } from './types';

export function extractContours(image: HTMLImageElement): Shape[] {
  const src = cv.imread(image);
  const gray = new cv.Mat();
  const edges = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Canny(gray, edges, 50, 150);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE
  );

  const shapes: Shape[] = [];

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);

    const points: Point[] = [];
    for (let j = 0; j < cnt.data32S.length; j += 2) {
      points.push({
        x: cnt.data32S[j],
        y: cnt.data32S[j + 1],
      });
    }

    if (points.length < 3) continue;

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    shapes.push({
      path: '',
      bbox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      complexity: points.length,
      points,
    });
  }

  src.delete();
  gray.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();

  return shapes;
}
