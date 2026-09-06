'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { X, Volume2, VolumeX, Sparkles, Award, RotateCcw, CheckCircle2, Trophy, HelpCircle } from 'lucide-react';

export interface Point {
  x: number;
  y: number;
}

export interface TracingShape {
  label: string;
  points: Point[];
}

interface TracingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  imageUrl?: string | null;
  shapes?: TracingShape[];
  onLessonComplete?: (lessonTitle: string) => void;
}

// Built-in Web Audio Sound FX with melodic scale
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
      // Pentatonic scale notes (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6)
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const noteIdx = Math.min(scale.length - 1, Math.floor((dotIndex / Math.max(1, totalDots)) * scale.length));
      const freq = scale[noteIdx] || 440;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
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
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.09);
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

// Fallback high-quality animal outlines if no contours are extracted
const DEFAULT_CAT_SHAPES: TracingShape[] = [
  {
    label: 'Cat Head & Ears',
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
    label: 'Cat Body & Paws',
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

export default function TracingGameModal({
  isOpen,
  onClose,
  lessonTitle = 'Interactive Tracing Room',
  imageUrl,
  shapes,
  onLessonComplete,
}: TracingGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [visitedDots, setVisitedDots] = useState<Set<number>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Connect all the glowing numbered dots!');
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null);

  // Load background image
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

  // Normalize shape coordinates to fit comfortably in 600x480 canvas
  const normalizedShapes = useMemo<TracingShape[]>(() => {
    const rawShapes = shapes && shapes.length > 0 ? shapes : DEFAULT_CAT_SHAPES;
    const canvasW = 600;
    const canvasH = 480;
    const margin = 50;

    return rawShapes.map((shape) => {
      if (shape.points.length === 0) return shape;

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const p of shape.points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }

      const shapeW = Math.max(1, maxX - minX);
      const shapeH = Math.max(1, maxY - minY);

      // If points are already normalized within [0, 600] and [0, 480], preserve or fit nicely
      const targetW = canvasW - margin * 2;
      const targetH = canvasH - margin * 2;
      const scale = Math.min(targetW / shapeW, targetH / shapeH, 1.4);

      const offsetX = (canvasW - shapeW * scale) / 2 - minX * scale;
      const offsetY = (canvasH - shapeH * scale) / 2 - minY * scale;

      const fittedPoints = shape.points.map((p) => ({
        x: Math.round(p.x * scale + offsetX),
        y: Math.round(p.y * scale + offsetY),
      }));

      return {
        label: shape.label,
        points: fittedPoints,
      };
    });
  }, [shapes]);

  const currentShape = normalizedShapes[currentShapeIndex] || normalizedShapes[0];

  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Reset stroke and visited dots on shape change
  useEffect(() => {
    setCurrentStroke([]);
    setVisitedDots(new Set());
    setFeedbackMessage('Connect each numbered dot in sequence!');
  }, [currentShapeIndex, normalizedShapes]);

  // Redraw canvas
  useEffect(() => {
    if (!isOpen) return;
    drawCanvas();
  }, [isOpen, currentShapeIndex, currentStroke, visitedDots, normalizedShapes, bgImageElement]);

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

    // Draw the actual selected image in the background with tasteful opacity
    if (bgImageElement && bgImageElement.complete && bgImageElement.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      // Draw image centered maintaining aspect ratio
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

    // Draw guide outline connecting the dots
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    currentShape.points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Draw user stroke with luminous neon glow
    if (currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      currentStroke.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Draw guide dots with dynamic visited state
    currentShape.points.forEach((pt, i) => {
      const isVisited = visitedDots.has(i);

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

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
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

  const checkDotProximity = (pt: Point) => {
    if (!currentShape) return;
    const hitRadius = 26; // 26px proximity radius

    currentShape.points.forEach((dot, idx) => {
      const dist = Math.hypot(pt.x - dot.x, pt.y - dot.y);
      if (dist <= hitRadius && !visitedDots.has(idx)) {
        setVisitedDots((prev) => {
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
        sfx.playDotChime(idx, currentShape.points.length);
      }
    });
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentStroke([pt]);
    checkDotProximity(pt);
    sfx.playStroke();
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => [...prev, pt]);
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

    // If user has connected at least 85% of the dots (or all dots)
    const passed = connectedCount >= Math.ceil(totalDots * 0.85);

    if (passed) {
      sfx.playSuccess();
      const pointsAwarded = percentage + 100;
      setScore((s) => s + pointsAwarded);
      setStars((st) => st + (percentage >= 95 ? 3 : percentage >= 85 ? 2 : 1));
      setFeedbackMessage(`🌟 Outstanding! All ${connectedCount} / ${totalDots} dots connected! +${pointsAwarded} pts`);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (currentShapeIndex + 1 < normalizedShapes.length) {
        setTimeout(() => {
          setCurrentShapeIndex((idx) => idx + 1);
          setVisitedDots(new Set());
          setCurrentStroke([]);
        }, 1400);
      } else {
        setLessonCompleted(true);
        if (onLessonComplete) {
          onLessonComplete(lessonTitle);
        }
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
    } else {
      setFeedbackMessage(`You connected ${connectedCount} of ${totalDots} dots (${percentage}%). Trace all dots to complete!`);
    }
  };

  const handleResetShape = () => {
    setVisitedDots(new Set());
    setCurrentStroke([]);
    setFeedbackMessage('Connect all the glowing numbered dots!');
  };

  const handleResetAll = () => {
    setCurrentShapeIndex(0);
    setScore(0);
    setStars(0);
    setCurrentStroke([]);
    setVisitedDots(new Set());
    setLessonCompleted(false);
    setFeedbackMessage('Connect all the glowing numbered dots!');
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
              <h2 className="text-base font-bold text-slate-100">{lessonTitle}</h2>
              <p className="text-xs text-slate-400">
                Shape {currentShapeIndex + 1} of {normalizedShapes.length}:{' '}
                <span className="text-indigo-400 font-semibold">{currentShape?.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Dots Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold">
              <span>{connectedDots} / {totalDots} Dots</span>
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
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 bg-[#090d16]">
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
                <h3 className="text-2xl font-black text-white mb-1">Tracing Mastered!</h3>
                <p className="text-sm text-slate-300 max-w-sm mb-4">
                  Awesome tracing! You connected all dots on {lessonTitle} and scored {score} points with {stars} stars!
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

          {/* Feedback & Instructions */}
          <div className="mt-3 w-full max-w-xl flex items-center justify-between text-xs px-2">
            <span className="text-slate-300 font-medium">{feedbackMessage}</span>
            <span className="text-slate-500">
              {connectedDots >= totalDots
                ? '🎉 All dots connected!'
                : `Trace remaining ${totalDots - connectedDots} dots`}
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <span>💡 Tip: Drag your finger or mouse from dot 1 through each number in order!</span>
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
