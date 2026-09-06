import { TracingShape } from '../components/TracingGameModal';

// High-quality, anatomically accurate shapes for Sea Turtle
export const DEFAULT_TURTLE_SHAPES: TracingShape[] = [
  {
    label: 'Sea Turtle Character Silhouette',
    points: [
      // Top of head & crown
      { x: 332, y: 66 },
      { x: 347, y: 69 },
      { x: 361, y: 78 },
      { x: 373, y: 94 },
      { x: 378, y: 116 },
      // Right cheek & smiling mouth
      { x: 383, y: 138 },
      { x: 381, y: 159 },
      { x: 372, y: 175 },
      // Waving hand & flipper fingers
      { x: 381, y: 186 },
      { x: 395, y: 195 },
      { x: 406, y: 209 },
      { x: 409, y: 222 },
      { x: 407, y: 234 },
      { x: 400, y: 250 },
      { x: 388, y: 262 },
      { x: 375, y: 272 },
      // Flank & shell rim under arm
      { x: 355, y: 278 },
      { x: 358, y: 294 },
      { x: 361, y: 312 },
      { x: 361, y: 331 },
      { x: 356, y: 350 },
      { x: 349, y: 366 },
      // Right leg & foot toes
      { x: 352, y: 381 },
      { x: 356, y: 400 },
      { x: 359, y: 414 },
      { x: 358, y: 425 },
      { x: 347, y: 428 },
      { x: 337, y: 428 },
      { x: 326, y: 422 },
      // Inner leg arch up to belly
      { x: 320, y: 400 },
      { x: 314, y: 375 },
      { x: 306, y: 350 },
      { x: 296, y: 341 },
      // Left leg & foot toes
      { x: 289, y: 362 },
      { x: 288, y: 388 },
      { x: 289, y: 409 },
      { x: 286, y: 428 },
      { x: 280, y: 444 },
      { x: 268, y: 447 },
      { x: 255, y: 445 },
      { x: 247, y: 434 },
      // Outer leg curve up to tail
      { x: 246, y: 412 },
      { x: 247, y: 391 },
      { x: 242, y: 372 },
      // Pointed tail
      { x: 230, y: 366 },
      { x: 213, y: 362 },
      { x: 201, y: 359 },
      { x: 213, y: 349 },
      { x: 226, y: 339 },
      // Main domed carapace shell (left curve)
      { x: 222, y: 319 },
      { x: 216, y: 294 },
      { x: 213, y: 269 },
      { x: 213, y: 244 },
      { x: 216, y: 219 },
      { x: 222, y: 194 },
      { x: 234, y: 172 },
      { x: 249, y: 153 },
      { x: 268, y: 141 },
      { x: 283, y: 131 },
      // Neck and back of head
      { x: 288, y: 109 },
      { x: 295, y: 88 },
      { x: 312, y: 70 },
    ],
  },
  {
    label: 'Turtle Head & Waving Hand',
    points: [
      { x: 332, y: 66 },
      { x: 347, y: 69 },
      { x: 361, y: 78 },
      { x: 373, y: 94 },
      { x: 378, y: 116 },
      { x: 383, y: 138 },
      { x: 381, y: 159 },
      { x: 372, y: 175 },
      { x: 381, y: 186 },
      { x: 395, y: 195 },
      { x: 406, y: 209 },
      { x: 409, y: 222 },
      { x: 407, y: 234 },
      { x: 400, y: 250 },
      { x: 388, y: 262 },
      { x: 375, y: 272 },
      { x: 361, y: 276 },
      { x: 347, y: 275 },
      { x: 332, y: 262 },
      { x: 320, y: 238 },
      { x: 309, y: 200 },
      { x: 298, y: 162 },
      { x: 288, y: 109 },
      { x: 295, y: 88 },
      { x: 312, y: 70 },
    ],
  },
  {
    label: 'Turtle Shell Hexagon Scutes',
    points: [
      { x: 268, y: 172 },
      { x: 288, y: 194 },
      { x: 286, y: 250 },
      { x: 264, y: 278 },
      { x: 241, y: 256 },
      { x: 243, y: 200 },
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
