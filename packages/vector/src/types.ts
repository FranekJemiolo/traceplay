export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  path: string;
  bbox: { x: number; y: number; width: number; height: number };
  complexity: number;
  points?: Point[];
}

export interface DrawingAsset {
  shapes: Shape[];
}
