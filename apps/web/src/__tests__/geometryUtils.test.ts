import {
  ccw,
  segmentsIntersect,
  hasCrossingLines,
  untanglePolygon,
  reducePointsToLimit,
} from '../lib/geometryUtils';

describe('Geometry Utils - Line Crossing & Untangling', () => {
  it('detects intersecting segments correctly', () => {
    // Cross: (0,0)-(10,10) and (0,10)-(10,0)
    expect(
      segmentsIntersect(
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 10, y: 0 }
      )
    ).toBe(true);

    // Parallel: (0,0)-(10,0) and (0,5)-(10,5)
    expect(
      segmentsIntersect(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 5 },
        { x: 10, y: 5 }
      )
    ).toBe(false);

    // Connected endpoints (not a cross)
    expect(
      segmentsIntersect(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      )
    ).toBe(false);
  });

  it('detects crossing lines in self-intersecting polygon (hourglass/bowtie)', () => {
    // Hourglass: 0->1->2->3->0 where (0,0)-(10,10) and (10,0)-(0,10) cross
    const bowtie = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ];
    expect(hasCrossingLines(bowtie)).toBe(true);

    // Untangling the bowtie should eliminate crossings
    const untangled = untanglePolygon(bowtie);
    expect(hasCrossingLines(untangled)).toBe(false);
  });

  it('reduces point count to limit and guarantees zero crossing lines', () => {
    // Circle with 30 points
    const circlePoints = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      circlePoints.push({
        x: Math.round(300 + Math.cos(angle) * 150),
        y: Math.round(240 + Math.sin(angle) * 150),
      });
    }

    const reduced = reducePointsToLimit(circlePoints, 8, 30);
    expect(reduced.length).toBeLessThanOrEqual(8);
    expect(reduced.length).toBeGreaterThanOrEqual(4);
    expect(hasCrossingLines(reduced)).toBe(false);

    // Verify pairwise minimum spacing
    for (let i = 0; i < reduced.length; i++) {
      for (let j = i + 1; j < reduced.length; j++) {
        const dist = Math.hypot(
          reduced[i].x - reduced[j].x,
          reduced[i].y - reduced[j].y
        );
        expect(dist).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it('guarantees zero crossing lines for all TRAINING_SHAPES', () => {
    const { TRAINING_SHAPES } = require('../components/TracingGameModal');
    TRAINING_SHAPES.forEach((shape: any) => {
      expect(hasCrossingLines(shape.points)).toBe(false);
    });
  });

  it('guarantees zero crossing lines for all predefined image shapes', () => {
    const {
      DEFAULT_TURTLE_SHAPES,
      DEFAULT_CAT_SAMPLE_SHAPES,
      DEFAULT_PLAYFUL_CAT_SHAPES,
    } = require('../lib/predefinedShapes');

    [...DEFAULT_TURTLE_SHAPES, ...DEFAULT_CAT_SAMPLE_SHAPES, ...DEFAULT_PLAYFUL_CAT_SHAPES].forEach(
      (shape: any) => {
        expect(hasCrossingLines(shape.points)).toBe(false);
      }
    );
  });

  it('does not reduce points when points count is already within maxCount limit', () => {
    const pts = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 250, y: 200 },
      { x: 200, y: 300 },
      { x: 100, y: 300 },
      { x: 50, y: 200 },
    ];
    // Limit is 100, input has 6 points -> should keep all 6 points!
    const result = reducePointsToLimit(pts, 100);
    expect(result.length).toBe(6);
  });

  it('supports high dot limits up to 100 without over-reducing', () => {
    // Generate an ellipse loop with 200 points
    const ellipsePoints = [];
    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * Math.PI * 2;
      ellipsePoints.push({
        x: Math.round(300 + Math.cos(angle) * 200),
        y: Math.round(240 + Math.sin(angle) * 150),
      });
    }

    // With limit 100, should keep around 90-100 points, never dropping to 10
    const highDensity = reducePointsToLimit(ellipsePoints, 100);
    expect(highDensity.length).toBeGreaterThanOrEqual(80);
    expect(highDensity.length).toBeLessThanOrEqual(100);
    expect(hasCrossingLines(highDensity)).toBe(false);

    // With limit 50, should keep around 40-50 points
    const medDensity = reducePointsToLimit(ellipsePoints, 50);
    expect(medDensity.length).toBeGreaterThanOrEqual(40);
    expect(medDensity.length).toBeLessThanOrEqual(50);
    expect(hasCrossingLines(medDensity)).toBe(false);
  });
});

