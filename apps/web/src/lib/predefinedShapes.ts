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

// Pixel-accurate contours for Cute Cat (Sample) - directly traced from cat_sample.png
export const DEFAULT_CAT_SAMPLE_SHAPES: TracingShape[] = [
  {
    label: 'Cute Cat Silhouette & Paws',
    points: [
      { x: 419, y: 40 },
      { x: 436, y: 67 },
      { x: 436, y: 100 },
      { x: 428, y: 134 },
      { x: 448, y: 166 },
      { x: 435, y: 195 },
      { x: 402, y: 224 },
      { x: 413, y: 257 },
      { x: 419, y: 290 },
      { x: 438, y: 321 },
      { x: 444, y: 354 },
      { x: 432, y: 388 },
      { x: 432, y: 421 },
      { x: 400, y: 429 },
      { x: 368, y: 440 },
      { x: 339, y: 422 },
      { x: 310, y: 439 },
      { x: 279, y: 428 },
      { x: 245, y: 426 },
      { x: 229, y: 402 },
      { x: 196, y: 388 },
      { x: 172, y: 355 },
      { x: 170, y: 321 },
      { x: 180, y: 288 },
      { x: 187, y: 254 },
      { x: 160, y: 229 },
      { x: 161, y: 197 },
      { x: 195, y: 200 },
      { x: 220, y: 231 },
      { x: 223, y: 265 },
      { x: 213, y: 298 },
      { x: 202, y: 332 },
      { x: 217, y: 365 },
      { x: 226, y: 351 },
      { x: 235, y: 317 },
      { x: 251, y: 287 },
      { x: 258, y: 253 },
      { x: 263, y: 223 },
      { x: 230, y: 193 },
      { x: 224, y: 166 },
      { x: 239, y: 132 },
      { x: 230, y: 98 },
      { x: 231, y: 65 },
      { x: 251, y: 43 },
      { x: 285, y: 65 },
      { x: 318, y: 73 },
      { x: 352, y: 73 },
      { x: 385, y: 61 },
    ],
  },
];

// Pixel-accurate contours for Playful Kitten - directly traced from cat_playful.png
export const DEFAULT_PLAYFUL_CAT_SHAPES: TracingShape[] = [
  {
    label: 'Playful Kitten Silhouette & Yarn',
    points: [
      { x: 360, y: 40 },
      { x: 380, y: 75 },
      { x: 381, y: 116 },
      { x: 396, y: 158 },
      { x: 396, y: 172 },
      { x: 395, y: 186 },
      { x: 367, y: 221 },
      { x: 408, y: 199 },
      { x: 440, y: 221 },
      { x: 419, y: 251 },
      { x: 461, y: 251 },
      { x: 469, y: 289 },
      { x: 472, y: 331 },
      { x: 474, y: 362 },
      { x: 516, y: 362 },
      { x: 476, y: 364 },
      { x: 442, y: 388 },
      { x: 400, y: 405 },
      { x: 358, y: 397 },
      { x: 333, y: 405 },
      { x: 355, y: 432 },
      { x: 313, y: 439 },
      { x: 271, y: 425 },
      { x: 230, y: 424 },
      { x: 188, y: 433 },
      { x: 193, y: 400 },
      { x: 151, y: 403 },
      { x: 118, y: 376 },
      { x: 87, y: 365 },
      { x: 120, y: 360 },
      { x: 118, y: 318 },
      { x: 105, y: 277 },
      { x: 107, y: 247 },
      { x: 125, y: 217 },
      { x: 164, y: 238 },
      { x: 182, y: 278 },
      { x: 165, y: 309 },
      { x: 181, y: 341 },
      { x: 184, y: 301 },
      { x: 209, y: 260 },
      { x: 216, y: 223 },
      { x: 193, y: 182 },
      { x: 189, y: 141 },
      { x: 181, y: 99 },
      { x: 206, y: 72 },
      { x: 247, y: 79 },
      { x: 284, y: 64 },
      { x: 319, y: 70 },
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
