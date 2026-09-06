'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Zap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { getPredefinedShapesForImage } from '../lib/predefinedShapes';
import { reducePointsToLimit } from '../lib/geometryUtils';

export interface Point {
  x: number;
  y: number;
}

export interface LineSegment {
  from: Point;
  to: Point;
}

export interface TracingShape {
  label: string;
  points: Point[];
}

export interface TracingStateNotification {
  mode: 'train' | 'studio';
  difficulty: 'easy' | 'hard';
  shapeIndex: number;
  score: number;
  stars: number;
}

interface TracingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  imageUrl?: string | null;
  shapes?: TracingShape[];
  onLessonComplete?: (lessonTitle: string) => void;
  mode?: 'train' | 'studio';
  initialDifficulty?: 'easy' | 'hard';
  initialShapeIndex?: number;
  initialScore?: number;
  initialStars?: number;
  onStateChange?: (state: TracingStateNotification) => void;
}

// Built-in Web Audio Sound FX with melodic scale and feedback chimes
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playStroke() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 40, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playDotChime(dotIndex: number, totalDots: number) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      // Melodic pentatonic scale notes (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6)
      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const noteIdx = Math.min(scale.length - 1, Math.floor((dotIndex / Math.max(1, totalDots)) * scale.length));
      const freq = scale[noteIdx] || 440;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  playResetBuzz() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    } catch {}
  }
}

const sfx = new SoundFX();

// Progressive geometric shapes designed specifically for Training mode (Easy shapes to advance forward)
export const TRAINING_SHAPES: TracingShape[] = [
  {
    label: 'Level 1: Circle',
    points: [
      { x: 430, y: 240 },
      { x: 392, y: 332 },
      { x: 300, y: 370 },
      { x: 208, y: 332 },
      { x: 170, y: 240 },
      { x: 208, y: 148 },
      { x: 300, y: 110 },
      { x: 392, y: 148 },
    ],
  },
  {
    label: 'Level 2: Triangle',
    points: [
      { x: 300, y: 110 },
      { x: 370, y: 230 },
      { x: 440, y: 350 },
      { x: 300, y: 350 },
      { x: 160, y: 350 },
      { x: 230, y: 230 },
    ],
  },
  {
    label: 'Level 3: Square',
    points: [
      { x: 180, y: 120 },
      { x: 300, y: 120 },
      { x: 420, y: 120 },
      { x: 420, y: 240 },
      { x: 420, y: 360 },
      { x: 300, y: 360 },
      { x: 180, y: 360 },
      { x: 180, y: 240 },
    ],
  },
  {
    label: 'Level 4: Diamond',
    points: [
      { x: 300, y: 110 },
      { x: 370, y: 175 },
      { x: 440, y: 240 },
      { x: 370, y: 305 },
      { x: 300, y: 370 },
      { x: 230, y: 305 },
      { x: 160, y: 240 },
      { x: 230, y: 175 },
    ],
  },
  {
    label: 'Level 5: Five-Point Star',
    points: [
      { x: 300, y: 100 },
      { x: 333, y: 190 },
      { x: 433, y: 196 },
      { x: 355, y: 255 },
      { x: 382, y: 350 },
      { x: 300, y: 295 },
      { x: 218, y: 350 },
      { x: 245, y: 255 },
      { x: 167, y: 196 },
      { x: 267, y: 190 },
    ],
  },
  {
    label: 'Level 6: Hexagon',
    points: [
      { x: 300, y: 105 },
      { x: 415, y: 172 },
      { x: 415, y: 307 },
      { x: 300, y: 375 },
      { x: 185, y: 307 },
      { x: 185, y: 172 },
    ],
  },
  {
    label: 'Level 7: Sweet Heart',
    points: [
      { x: 300, y: 170 },
      { x: 340, y: 130 },
      { x: 390, y: 140 },
      { x: 410, y: 190 },
      { x: 380, y: 250 },
      { x: 300, y: 340 },
      { x: 220, y: 250 },
      { x: 190, y: 190 },
      { x: 210, y: 140 },
      { x: 260, y: 130 },
    ],
  },
  {
    label: 'Level 8: Cat Face Contour',
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
    label: 'Level 9: Playful Kitten Silhouette',
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

// Fallback high-quality animal outlines if no contours are extracted
const DEFAULT_CAT_SHAPES: TracingShape[] = [
  TRAINING_SHAPES[7],
  TRAINING_SHAPES[8],
];

// Math helper: distance from point P to line segment AB
function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

export default function TracingGameModal({
  isOpen,
  onClose,
  lessonTitle = 'Interactive Tracing Room',
  imageUrl,
  shapes,
  onLessonComplete,
  mode = 'studio',
  initialDifficulty = 'easy',
  initialShapeIndex = 0,
  initialScore = 0,
  initialStars = 0,
  onStateChange,
}: TracingGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>(initialDifficulty);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(initialShapeIndex);
  const [score, setScore] = useState(initialScore);
  const [stars, setStars] = useState(initialStars);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [visitedDots, setVisitedDots] = useState<Set<number>>(new Set());
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);
  const [completedSegments, setCompletedSegments] = useState<LineSegment[]>([]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Connect all the glowing numbered dots in order!');
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null);
  const [isOffTrackAlert, setIsOffTrackAlert] = useState(false);

  // Sync props when opening / changing external initial states
  useEffect(() => {
    if (initialDifficulty) setDifficulty(initialDifficulty);
  }, [initialDifficulty]);

  useEffect(() => {
    if (typeof initialShapeIndex === 'number') setCurrentShapeIndex(initialShapeIndex);
  }, [initialShapeIndex]);

  useEffect(() => {
    if (typeof initialScore === 'number') setScore(initialScore);
  }, [initialScore]);

  useEffect(() => {
    if (typeof initialStars === 'number') setStars(initialStars);
  }, [initialStars]);

  // Notify parent of state changes (for URL hash persistence)
  const notifyStateChange = useCallback(
    (newIdx = currentShapeIndex, newDiff = difficulty, newScore = score, newStars = stars) => {
      if (onStateChange) {
        onStateChange({
          mode,
          difficulty: newDiff,
          shapeIndex: newIdx,
          score: newScore,
          stars: newStars,
        });
      }
    },
    [mode, difficulty, currentShapeIndex, score, stars, onStateChange]
  );

  // Load background image (and retain it across shapes/replays!)
  useEffect(() => {
    if (!imageUrl) {
      setBgImageElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => setBgImageElement(img);
  }, [imageUrl]);

  // Determine active shape pool: Training mode uses easy progressive shapes
  const activeShapePool = useMemo<TracingShape[]>(() => {
    if (mode === 'train') {
      return TRAINING_SHAPES;
    }
    if (shapes && shapes.length > 0) {
      return shapes;
    }
    return getPredefinedShapesForImage(imageUrl);
  }, [mode, shapes, imageUrl]);

  // Normalize shape coordinates and filter out overlapping/crowded dots based on difficulty
  const normalizedShapes = useMemo<TracingShape[]>(() => {
    const canvasW = 600;
    const canvasH = 480;
    const margin = 50;

    // Minimum distance threshold to ensure dots NEVER overlap:
    // Easy mode: larger spacing (46px) and fewer dots (max 10) for kid-friendly tracing
    // Hard mode: exact spacing (32px) and up to 16 dots
    const minDotDist = difficulty === 'easy' ? 46 : 32;
    const maxDots = difficulty === 'easy' ? 10 : 16;

    return activeShapePool.map((shape) => {
      if (shape.points.length === 0) return shape;

      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;

      for (const p of shape.points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }

      const shapeW = Math.max(1, maxX - minX);
      const shapeH = Math.max(1, maxY - minY);

      const targetW = canvasW - margin * 2;
      const targetH = canvasH - margin * 2;
      const scale = Math.min(targetW / shapeW, targetH / shapeH, 1.4);

      const offsetX = (canvasW - shapeW * scale) / 2 - minX * scale;
      const offsetY = (canvasH - shapeH * scale) / 2 - minY * scale;

      const fittedPoints = shape.points.map((p) => ({
        x: Math.round(p.x * scale + offsetX),
        y: Math.round(p.y * scale + offsetY),
      }));

      // Arc-length perimeter reduction + non-overlapping spacing + 2-opt untangling
      // Guarantees zero crossing lines and a child-friendly dot count
      const finalPoints = reducePointsToLimit(fittedPoints, maxDots, minDotDist);

      return {
        label: shape.label,
        points: finalPoints,
      };
    });
  }, [activeShapePool, difficulty]);

  const currentShape = normalizedShapes[currentShapeIndex] || normalizedShapes[0];

  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Reset stroke, lines, and visited dots on shape or difficulty change
  useEffect(() => {
    setCurrentStroke([]);
    setVisitedDots(new Set());
    setVisitedOrder([]);
    setCompletedSegments([]);
    setFeedbackMessage(
      difficulty === 'hard'
        ? 'Hard Mode: Start at Dot 1 and follow exact order. Stay on the line!'
        : 'Easy Mode: Connect dots in order or any path. Wide touch radius!'
    );
  }, [currentShapeIndex, normalizedShapes, difficulty]);

  // Redraw canvas on state changes
  useEffect(() => {
    if (!isOpen) return;
    drawCanvas();
  }, [
    isOpen,
    currentShapeIndex,
    currentStroke,
    visitedDots,
    visitedOrder,
    completedSegments,
    normalizedShapes,
    bgImageElement,
    difficulty,
  ]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Dark chalkboard background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.fillStyle = '#1e293b';
    for (let x = 20; x < width; x += 30) {
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw the actual selected image in the background with tasteful opacity (always preserved!)
    if (bgImageElement && bgImageElement.complete && bgImageElement.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      const imgW = bgImageElement.naturalWidth;
      const imgH = bgImageElement.naturalHeight;
      const scale = Math.min((width - 80) / imgW, (height - 80) / imgH);
      const dw = imgW * scale;
      const dh = imgH * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;

      ctx.drawImage(bgImageElement, dx, dy, dw, dh);
      ctx.restore();
    }

    if (!currentShape || currentShape.points.length < 2) return;

    // 1. Draw guide outline connecting the dots (dashed path)
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = difficulty === 'hard' ? '#273449' : '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    currentShape.points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 2. KEEP THE LINES: Permanently draw all completed segments with brilliant luminous neon glow
    if (completedSegments.length > 0) {
      ctx.save();
      // Outer neon aura
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      completedSegments.forEach((seg) => {
        ctx.moveTo(seg.from.x, seg.from.y);
        ctx.lineTo(seg.to.x, seg.to.y);
      });
      ctx.stroke();

      // Sharp luminous core
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      completedSegments.forEach((seg) => {
        ctx.moveTo(seg.from.x, seg.from.y);
        ctx.lineTo(seg.to.x, seg.to.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw active stroke while drawing
    if (currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      currentStroke.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Determine the next expected target dot index
    const nextExpectedIdx =
      visitedOrder.length < currentShape.points.length ? visitedOrder.length : null;

    // 4. Draw numbered dots with clear active, visited, and unvisited states
    currentShape.points.forEach((pt, i) => {
      const isVisited = visitedDots.has(i);
      const isNextTarget = i === nextExpectedIdx;

      if (isVisited) {
        // Connected Dot (Emerald Glowing Aura)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Check badge
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✓ ${i + 1}`, pt.x, pt.y - 14);
      } else if (isNextTarget) {
        // NEXT TARGET DOT (Pulsating amber/cyan radar guidance)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Target badge
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i === 0 ? `START ${i + 1}` : `NEXT ${i + 1}`, pt.x, pt.y - 16);
      } else {
        // Unvisited Dot (Indigo Target)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Number badge
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((i + 1).toString(), pt.x, pt.y - 14);
      }
    });
  };

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Reset to beginning if user wanders too far off track
  const handleResetToStart = (reasonMsg?: string) => {
    setVisitedDots(new Set());
    setVisitedOrder([]);
    setCompletedSegments([]);
    setCurrentStroke([]);
    setIsDrawing(false);
    setIsOffTrackAlert(true);
    sfx.playResetBuzz();
    setFeedbackMessage(
      reasonMsg ||
        (difficulty === 'hard'
          ? '⚠️ Straying too far off path! Resetting to Dot 1.'
          : '⚠️ Too far from dots! Resetting to start.')
    );
    setTimeout(() => setIsOffTrackAlert(false), 1400);
  };

  // Check proximity to dots respecting difficulty and order
  const checkDotProximity = (pt: Point) => {
    if (!currentShape || currentShape.points.length === 0) return;

    // Difficulty settings: hit radius and ordering requirements
    const hitRadius = difficulty === 'hard' ? 24 : 46;
    const nextExpectedIdx = visitedOrder.length;
    if (nextExpectedIdx >= currentShape.points.length) return;

    const targetDot = currentShape.points[nextExpectedIdx];
    const dist = Math.hypot(pt.x - targetDot.x, pt.y - targetDot.y);

    if (dist <= hitRadius) {
      // Connected the expected sequential dot!
      if (visitedOrder.length > 0) {
        const lastIdx = visitedOrder[visitedOrder.length - 1];
        const lastDot = currentShape.points[lastIdx];
        setCompletedSegments((prev) => [...prev, { from: lastDot, to: targetDot }]);
      }

      const newOrder = [...visitedOrder, nextExpectedIdx];
      setVisitedOrder(newOrder);
      setVisitedDots((prev) => new Set([...prev, nextExpectedIdx]));
      setCurrentStroke([targetDot]); // anchor stroke to connected dot
      sfx.playDotChime(nextExpectedIdx, currentShape.points.length);
      setFeedbackMessage(
        newOrder.length === currentShape.points.length
          ? '🎉 Awesome! All dots connected without crossing lines!'
          : `✓ Dot ${nextExpectedIdx + 1} connected! Trace to Dot ${nextExpectedIdx + 2}`
      );
    } else if (difficulty === 'easy') {
      // In easy mode, if user touches a different unvisited dot out-of-order, guide them
      const touchingOther = currentShape.points.findIndex(
        (d, idx) =>
          idx !== nextExpectedIdx &&
          !visitedDots.has(idx) &&
          Math.hypot(pt.x - d.x, pt.y - d.y) <= hitRadius
      );
      if (touchingOther !== -1) {
        setFeedbackMessage(
          `👉 Trace to glowing Dot ${nextExpectedIdx + 1} next so lines don't cross!`
        );
      }
    }
  };

  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!currentShape || currentShape.points.length === 0) return;
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentStroke([pt]);

    // Drawing must initiate at or near Dot 1 when starting
    if (visitedOrder.length === 0) {
      const dot0 = currentShape.points[0];
      const startRadius = difficulty === 'hard' ? 30 : 48;
      const dist = Math.hypot(pt.x - dot0.x, pt.y - dot0.y);
      if (dist <= startRadius) {
        checkDotProximity(pt);
      } else {
        setFeedbackMessage('👉 Start by touching glowing Dot 1!');
      }
    } else {
      checkDotProximity(pt);
    }
    sfx.playStroke();
  };

  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    if (!currentShape || currentShape.points.length === 0) return;

    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => [...prev, pt]);

    // OFF-TRACK DEVIATION CHECK:
    // If you stray too far from the expected path, redo from beginning!
    const maxTolerance = difficulty === 'hard' ? 38 : 110;

    if (difficulty === 'hard') {
      const lastIdx = visitedOrder.length > 0 ? visitedOrder[visitedOrder.length - 1] : null;
      const nextIdx = visitedOrder.length < currentShape.points.length ? visitedOrder.length : null;

      if (lastIdx !== null && nextIdx !== null) {
        const segA = currentShape.points[lastIdx];
        const segB = currentShape.points[nextIdx];
        const devDist = pointToSegmentDistance(pt, segA, segB);

        if (devDist > maxTolerance) {
          handleResetToStart('⚠️ Wandered too far off the line! Redo from Dot 1.');
          return;
        }
      }
    } else {
      // In Easy mode, gentle guided tolerance (110px) to prevent stray lines that cross previous segments
      const lastIdx = visitedOrder.length > 0 ? visitedOrder[visitedOrder.length - 1] : null;
      const nextIdx = visitedOrder.length < currentShape.points.length ? visitedOrder.length : null;

      if (lastIdx !== null && nextIdx !== null) {
        const segA = currentShape.points[lastIdx];
        const segB = currentShape.points[nextIdx];
        const devDist = pointToSegmentDistance(pt, segA, segB);

        if (devDist > maxTolerance) {
          handleResetToStart('⚠️ Wandered off the line! Trace gently between dots.');
          return;
        }
      }
    }

    checkDotProximity(pt);

    if (currentStroke.length % 5 === 0) {
      sfx.playStroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (!currentShape || currentShape.points.length === 0) return;

    const totalDots = currentShape.points.length;
    const connectedCount = visitedDots.size;
    const percentage = Math.round((connectedCount / totalDots) * 100);

    // Completion condition: connected all dots (or >=85% in easy mode)
    const passed =
      difficulty === 'hard'
        ? connectedCount === totalDots
        : connectedCount >= Math.ceil(totalDots * 0.85);

    if (passed) {
      // Connect closing loop segment if full shape completed
      if (connectedCount === totalDots && totalDots >= 3) {
        const firstPt = currentShape.points[visitedOrder[0]];
        const lastPt = currentShape.points[visitedOrder[visitedOrder.length - 1]];
        setCompletedSegments((prev) => [...prev, { from: lastPt, to: firstPt }]);
      }

      sfx.playSuccess();
      const pointsAwarded = percentage + (difficulty === 'hard' ? 180 : 100);
      const earnedStars = percentage >= 95 ? 3 : percentage >= 85 ? 2 : 1;

      const updatedScore = score + pointsAwarded;
      const updatedStars = stars + earnedStars;

      setScore(updatedScore);
      setStars(updatedStars);
      setFeedbackMessage(
        `🌟 Outstanding! ${connectedCount}/${totalDots} dots connected in ${difficulty} mode! +${pointsAwarded} pts`
      );

      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
      });

      // Progress forward to next shape in Training mode!
      if (currentShapeIndex + 1 < normalizedShapes.length) {
        setTimeout(() => {
          const nextIdx = currentShapeIndex + 1;
          setCurrentShapeIndex(nextIdx);
          setVisitedDots(new Set());
          setVisitedOrder([]);
          setCompletedSegments([]);
          setCurrentStroke([]);
          notifyStateChange(nextIdx, difficulty, updatedScore, updatedStars);
        }, 1300);
      } else {
        setLessonCompleted(true);
        if (onLessonComplete) {
          onLessonComplete(lessonTitle);
        }
        notifyStateChange(currentShapeIndex, difficulty, updatedScore, updatedStars);
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
    } else {
      setFeedbackMessage(
        `Connected ${connectedCount} of ${totalDots} dots (${percentage}%). ${
          difficulty === 'hard' ? 'Follow exact order to complete!' : 'Connect all dots to finish!'
        }`
      );
    }
  };

  const handleDifficultyChange = (newDiff: 'easy' | 'hard') => {
    setDifficulty(newDiff);
    setVisitedDots(new Set());
    setVisitedOrder([]);
    setCompletedSegments([]);
    setCurrentStroke([]);
    notifyStateChange(currentShapeIndex, newDiff, score, stars);
  };

  // Replay shape while REUSING picture!
  const handleResetShape = () => {
    setVisitedDots(new Set());
    setVisitedOrder([]);
    setCompletedSegments([]);
    setCurrentStroke([]);
    setFeedbackMessage(
      difficulty === 'hard' ? 'Hard Mode: Follow exact order from Dot 1.' : 'Connect all numbered dots!'
    );
  };

  // Replay all while REUSING picture!
  const handleResetAll = () => {
    setCurrentShapeIndex(0);
    setScore(0);
    setStars(0);
    setCurrentStroke([]);
    setVisitedDots(new Set());
    setVisitedOrder([]);
    setCompletedSegments([]);
    setLessonCompleted(false);
    setFeedbackMessage('Connect all the glowing numbered dots in order!');
    notifyStateChange(0, difficulty, 0, 0);
  };

  if (!isOpen) return null;

  const totalDots = currentShape?.points.length || 0;
  const connectedDots = visitedDots.size;
  const progressPercent = totalDots > 0 ? Math.round((connectedDots / totalDots) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{lessonTitle}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    mode === 'train'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {mode === 'train' ? 'Training Course' : 'Studio Practice'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shape {currentShapeIndex + 1} of {normalizedShapes.length}:{' '}
                <span className="text-indigo-400 font-semibold">{currentShape?.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Difficulty Selector Toggle */}
            <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => handleDifficultyChange('easy')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  difficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Easy: Relaxed order, generous 42px touch radius, lenient path tolerance"
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultyChange('hard')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  difficulty === 'hard'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Hard: Strict 1->2->3 order, 22px touch radius, straying off path forces redo from start!"
              >
                <Zap className="w-3 h-3" /> Hard
              </button>
            </div>

            {/* Live Dots Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold">
              <span>
                {connectedDots} / {totalDots} Dots
              </span>
            </div>

            {/* Score Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>{score} pts</span>
              <span className="ml-1 text-[10px] text-amber-400">({stars} ⭐)</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tracing Canvas Area */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-slate-900">
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-300 bg-[#090d16] ${
              isOffTrackAlert
                ? 'border-rose-500 shadow-rose-500/30 animate-shake'
                : 'border-indigo-500/30'
            }`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="cursor-crosshair touch-none select-none max-w-full h-auto"
              style={{ width: '600px', height: '480px' }}
            />

            {/* Off-Track Deviation Flash Banner */}
            {isOffTrackAlert && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-500 text-rose-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Too far off path! Resetting to start...</span>
              </div>
            )}

            {/* Top Shape Progression Bar */}
            <div className="absolute top-3 left-3 right-3 flex gap-2 z-10">
              {normalizedShapes.map((s, idx) => (
                <div
                  key={s.label + idx}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    idx < currentShapeIndex
                      ? 'bg-emerald-400'
                      : idx === currentShapeIndex
                      ? 'bg-indigo-400 shadow-md shadow-indigo-400/50'
                      : 'bg-slate-800/80'
                  }`}
                />
              ))}
            </div>

            {/* Live Dot Completion Progress Meter */}
            <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-md rounded-xl px-4 py-2 flex items-center justify-between border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Dots Connected:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {connectedDots} / {totalDots}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({difficulty === 'hard' ? 'Strict Sequential' : 'Relaxed Order'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-200">{progressPercent}%</span>
              </div>
            </div>

            {/* Completed Modal Overlay */}
            {lessonCompleted && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300 z-30">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                  <Trophy className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {mode === 'train' ? 'Training Course Completed!' : 'Tracing Mastered!'}
                </h3>
                <p className="text-sm text-slate-300 max-w-sm mb-4">
                  Outstanding job! You connected all dots in {difficulty} mode, scoring {score} points and earning {stars} stars while keeping clean lines!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                  >
                    <RotateCcw className="w-4 h-4" /> Replay Lesson
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Complete & Return
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Instructions Bar */}
          <div className="mt-3 w-full max-w-xl flex items-center justify-between text-xs px-2">
            <span
              className={`font-medium ${
                isOffTrackAlert ? 'text-rose-400 font-bold' : 'text-slate-300'
              }`}
            >
              {feedbackMessage}
            </span>
            <span className="text-slate-500">
              {connectedDots >= totalDots
                ? '🎉 All dots connected!'
                : `Trace remaining ${totalDots - connectedDots} dots`}
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <span>
            {difficulty === 'hard'
              ? '💡 Hard Rules: Trace dots 1, 2, 3... in exact order without straying off the line!'
              : '💡 Easy Rules: Connect dots smoothly. Faint lines stay permanently illuminated!'}
          </span>
          <button
            onClick={handleResetShape}
            className="hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Trace
          </button>
        </div>
      </div>
    </div>
  );
}
