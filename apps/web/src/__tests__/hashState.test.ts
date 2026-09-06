import { encodeHashState, decodeHashState, TrainingHashState } from '../lib/hashState';
import { TRAINING_SHAPES } from '../components/TracingGameModal';

describe('Training Hash State Serialization', () => {
  it('should accurately encode and decode training state in base64', () => {
    const originalState: TrainingHashState = {
      mode: 'train',
      diff: 'hard',
      idx: 3,
      score: 450,
      stars: 6,
    };

    const encoded = encodeHashState(originalState);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    // Decode with state= prefix
    const decodedWithPrefix = decodeHashState(`#state=${encoded}`);
    expect(decodedWithPrefix).toEqual(originalState);

    // Decode with direct hash
    const decodedDirect = decodeHashState(`#${encoded}`);
    expect(decodedDirect).toEqual(originalState);

    // Decode without hash symbol
    const decodedBare = decodeHashState(encoded);
    expect(decodedBare).toEqual(originalState);
  });

  it('should handle easy difficulty and zero defaults correctly', () => {
    const easyState: TrainingHashState = {
      mode: 'studio',
      diff: 'easy',
      idx: 0,
      score: 0,
      stars: 0,
    };

    const encoded = encodeHashState(easyState);
    const decoded = decodeHashState(`state=${encoded}`);
    expect(decoded).toEqual(easyState);
  });

  it('should return null for invalid, corrupted or empty hash', () => {
    expect(decodeHashState('')).toBeNull();
    expect(decodeHashState('#')).toBeNull();
    expect(decodeHashState('#state=')).toBeNull();
    expect(decodeHashState('not-valid-base64-content!@#$%')).toBeNull();
    expect(decodeHashState('#state=invalid!!!')).toBeNull();
  });
});

describe('Training Shapes Progression', () => {
  it('should provide progressive shapes starting with easy geometric shapes', () => {
    expect(TRAINING_SHAPES.length).toBeGreaterThanOrEqual(7);

    // Level 1: Circle
    expect(TRAINING_SHAPES[0].label).toContain('Circle');
    expect(TRAINING_SHAPES[0].points.length).toBe(8);

    // Level 2: Triangle
    expect(TRAINING_SHAPES[1].label).toContain('Triangle');
    expect(TRAINING_SHAPES[1].points.length).toBeGreaterThanOrEqual(3);

    // Level 3: Square
    expect(TRAINING_SHAPES[2].label).toContain('Square');
    expect(TRAINING_SHAPES[2].points.length).toBeGreaterThanOrEqual(4);

    // All points should have valid coordinates and maintain non-overlapping distance
    TRAINING_SHAPES.forEach((shape) => {
      expect(shape.points.length).toBeGreaterThan(0);
      expect(shape.points.length).toBeLessThanOrEqual(16); // Never overcrowded on easy
      shape.points.forEach((pt) => {
        expect(typeof pt.x).toBe('number');
        expect(typeof pt.y).toBe('number');
        expect(pt.x).toBeGreaterThan(0);
        expect(pt.y).toBeGreaterThan(0);
      });

      // Assert no points overlap (minimum Euclidean distance of 40px)
      for (let i = 0; i < shape.points.length; i++) {
        for (let j = i + 1; j < shape.points.length; j++) {
          const dist = Math.hypot(
            shape.points[i].x - shape.points[j].x,
            shape.points[i].y - shape.points[j].y
          );
          expect(dist).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });
});

