import { TracingShape } from '../components/TracingGameModal';

// High-quality, anatomically accurate shapes for Sea Turtle
export const DEFAULT_TURTLE_SHAPES: TracingShape[] = [
  {
    label: 'Sea Turtle Shell & Body',
    points: [
      { x: 260, y: 150 }, // Top of shell
      { x: 330, y: 170 }, // Upper shell curve
      { x: 390, y: 220 }, // Neck / shell joint
      { x: 420, y: 290 }, // Chest / belly
      { x: 400, y: 370 }, // Right leg / foot
      { x: 330, y: 400 }, // Lower belly
      { x: 260, y: 400 }, // Left foot
      { x: 200, y: 360 }, // Lower shell edge
      { x: 170, y: 290 }, // Left shell edge
      { x: 190, y: 210 }, // Upper left shell
    ],
  },
  {
    label: 'Turtle Head & Waving Hand',
    points: [
      { x: 340, y: 120 }, // Top of head
      { x: 390, y: 130 }, // Forehead
      { x: 425, y: 165 }, // Cheek & smile
      { x: 410, y: 205 }, // Chin
      { x: 455, y: 215 }, // Waving hand top
      { x: 475, y: 245 }, // Waving hand palm
      { x: 435, y: 265 }, // Arm base
      { x: 380, y: 235 }, // Scarf / neck
      { x: 325, y: 180 }, // Back of neck
    ],
  },
  {
    label: 'Turtle Shell Hexagon Scutes',
    points: [
      { x: 230, y: 210 },
      { x: 280, y: 200 },
      { x: 330, y: 230 },
      { x: 340, y: 290 },
      { x: 300, y: 340 },
      { x: 240, y: 340 },
      { x: 200, y: 300 },
      { x: 200, y: 240 },
    ],
  },
];

// High-quality shapes for Cute Cat (Sample)
export const DEFAULT_CAT_SAMPLE_SHAPES: TracingShape[] = [
  {
    label: 'Cute Cat Head & Ears',
    points: [
      { x: 300, y: 120 },
      { x: 370, y: 135 },
      { x: 420, y: 90 },
      { x: 420, y: 180 },
      { x: 440, y: 240 },
      { x: 410, y: 310 },
      { x: 300, y: 340 },
      { x: 190, y: 310 },
      { x: 160, y: 240 },
      { x: 180, y: 180 },
      { x: 180, y: 90 },
      { x: 230, y: 135 },
    ],
  },
  {
    label: 'Cute Cat Body & Paws',
    points: [
      { x: 300, y: 340 },
      { x: 380, y: 360 },
      { x: 410, y: 410 },
      { x: 350, y: 440 },
      { x: 300, y: 440 },
      { x: 250, y: 440 },
      { x: 190, y: 410 },
      { x: 220, y: 360 },
    ],
  },
];

// High-quality shapes for Playful Kitten
export const DEFAULT_PLAYFUL_CAT_SHAPES: TracingShape[] = [
  {
    label: 'Playful Kitten Head & Ears',
    points: [
      { x: 260, y: 130 },
      { x: 320, y: 120 },
      { x: 370, y: 160 },
      { x: 400, y: 220 },
      { x: 380, y: 280 },
      { x: 330, y: 310 },
      { x: 270, y: 300 },
      { x: 220, y: 250 },
      { x: 210, y: 180 },
      { x: 220, y: 140 },
    ],
  },
  {
    label: 'Yarn Ball & Playful Paws',
    points: [
      { x: 360, y: 320 },
      { x: 420, y: 320 },
      { x: 450, y: 360 },
      { x: 450, y: 420 },
      { x: 400, y: 450 },
      { x: 340, y: 440 },
      { x: 310, y: 390 },
      { x: 320, y: 340 },
    ],
  },
];

export function getPredefinedShapesForImage(keyOrUrl?: string | null): TracingShape[] {
  if (!keyOrUrl) return DEFAULT_CAT_SAMPLE_SHAPES;
  const lower = keyOrUrl.toLowerCase();
  if (lower.includes('turtle')) {
    return DEFAULT_TURTLE_SHAPES;
  }
  if (lower.includes('cat_playful') || lower.includes('playful')) {
    return DEFAULT_PLAYFUL_CAT_SHAPES;
  }
  if (lower.includes('cat_sample') || lower.includes('cat')) {
    return DEFAULT_CAT_SAMPLE_SHAPES;
  }
  return DEFAULT_CAT_SAMPLE_SHAPES;
}
