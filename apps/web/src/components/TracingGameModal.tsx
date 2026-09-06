'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Volume2, VolumeX, Sparkles, Award, RotateCcw, CheckCircle2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface TracingShape {
  label: string;
  points: Point[];
}

interface TracingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  shapes?: TracingShape[];
}

// Built-in Web Audio Sound FX
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
      osc.frequency.setValueAtTime(360 + Math.random() * 80, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {}
  }
}

const sfx = new SoundFX();

const DEFAULT_SHAPES: TracingShape[] = [
  {
    label: 'Playful Star',
    points: [
      { x: 300, y: 80 },
      { x: 350, y: 200 },
      { x: 480, y: 210 },
      { x: 380, y: 300 },
      { x: 410, y: 430 },
      { x: 300, y: 350 },
      { x: 190, y: 430 },
      { x: 220, y: 300 },
      { x: 120, y: 210 },
      { x: 250, y: 200 },
    ],
  },
  {
    label: 'Golden Heart',
    points: [
      { x: 300, y: 380 },
      { x: 180, y: 260 },
      { x: 160, y: 160 },
      { x: 220, y: 110 },
      { x: 300, y: 170 },
      { x: 380, y: 110 },
      { x: 440, y: 160 },
      { x: 420, y: 260 },
    ],
  },
  {
    label: 'Friendly Triangle',
    points: [
      { x: 300, y: 100 },
      { x: 480, y: 400 },
      { x: 120, y: 400 },
    ],
  },
];

export default function TracingGameModal({
  isOpen,
  onClose,
  lessonTitle = 'Interactive Tracing Room',
  shapes = DEFAULT_SHAPES,
}: TracingGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Connect the glowing dots!');

  const activeShapes = shapes.length > 0 ? shapes : DEFAULT_SHAPES;
  const currentShape = activeShapes[currentShapeIndex] || activeShapes[0];

  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Redraw canvas whenever shape changes or during drawing
  useEffect(() => {
    if (!isOpen) return;
    drawCanvas();
  }, [isOpen, currentShapeIndex, currentStroke, activeShapes]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const width = 600;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Dark sleek chalkboard background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid dots
    ctx.fillStyle = '#1e293b';
    for (let x = 20; x < width; x += 30) {
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!currentShape || currentShape.points.length < 2) return;

    // Draw guide outline (dashed, soft indigo)
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    currentShape.points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Draw numbered guide dots
    currentShape.points.forEach((pt, i) => {
      // Glow circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();

      // Inner white dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Number badge
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), pt.x, pt.y - 16);
    });

    // Draw user stroke with vibrant neon glow
    if (currentStroke.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      currentStroke.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }
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

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentStroke([pt]);
    sfx.playStroke();
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setCurrentStroke((prev) => [...prev, pt]);

    if (currentStroke.length % 4 === 0) {
      sfx.playStroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length < 5) {
      setCurrentStroke([]);
      return;
    }

    // Evaluate accuracy
    const currentShape = activeShapes[currentShapeIndex];
    if (!currentShape) return;

    let hits = 0;
    const toleranceSq = 2000; // ~45px radius

    for (const strokePt of currentStroke) {
      for (const shapePt of currentShape.points) {
        const dx = strokePt.x - shapePt.x;
        const dy = strokePt.y - shapePt.y;
        if (dx * dx + dy * dy < toleranceSq) {
          hits++;
          break;
        }
      }
    }

    const calculatedAccuracy = hits / currentStroke.length;
    const accuracyPercent = Math.round(calculatedAccuracy * 100);
    setAccuracy(accuracyPercent);

    if (calculatedAccuracy >= 0.5) {
      // Shape completed successfully
      sfx.playSuccess();
      const pointsAwarded = accuracyPercent + 50;
      setScore((s) => s + pointsAwarded);
      setStars((st) => st + (accuracyPercent > 80 ? 3 : accuracyPercent > 65 ? 2 : 1));
      setFeedbackMessage(`🌟 Fantastic! ${accuracyPercent}% Accuracy! +${pointsAwarded} pts`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (currentShapeIndex + 1 < activeShapes.length) {
        setTimeout(() => {
          setCurrentShapeIndex((idx) => idx + 1);
          setCurrentStroke([]);
          setAccuracy(null);
          setFeedbackMessage('Next shape! Connect the dots in order.');
        }, 1200);
      } else {
        setLessonCompleted(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
      }
    } else {
      setFeedbackMessage(`Almost there! (${accuracyPercent}%) Stay closer to the dotted line.`);
      setTimeout(() => {
        setCurrentStroke([]);
      }, 800);
    }
  };

  const handleReset = () => {
    setCurrentShapeIndex(0);
    setScore(0);
    setStars(0);
    setCurrentStroke([]);
    setLessonCompleted(false);
    setAccuracy(null);
    setFeedbackMessage('Connect the glowing dots!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{lessonTitle}</h2>
              <p className="text-xs text-slate-400">
                Shape {currentShapeIndex + 1} of {activeShapes.length}:{' '}
                <span className="text-indigo-400 font-semibold">{currentShape?.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm font-semibold">
              <Award className="w-4 h-4" />
              <span>{score} pts</span>
              <span className="text-xs ml-1">({stars} ⭐)</span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tracing Canvas Area */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-slate-900/90">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/30">
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

            {/* Shape Progression Bar */}
            <div className="absolute top-3 left-3 right-3 flex gap-2 z-10">
              {activeShapes.map((s, idx) => (
                <div
                  key={s.label + idx}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    idx < currentShapeIndex
                      ? 'bg-emerald-400'
                      : idx === currentShapeIndex
                      ? 'bg-indigo-400 animate-pulse'
                      : 'bg-slate-700/60'
                  }`}
                />
              ))}
            </div>

            {/* Completed Modal Overlay */}
            {lessonCompleted && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Lesson Mastered!</h3>
                <p className="text-sm text-slate-300 max-w-sm mb-4">
                  Outstanding job! You traced all shapes and collected {stars} stars with {score} total points!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Replay Lesson
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/30"
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback bar */}
          <div className="mt-4 w-full max-w-md flex items-center justify-between text-sm px-2">
            <span className="text-slate-300 font-medium">{feedbackMessage}</span>
            {accuracy !== null && (
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${accuracy >= 55 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                Accuracy: {accuracy}%
              </span>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>💡 Tip: Trace continuously from dot #1 to dot #2 and around the shape.</span>
          <button
            onClick={() => setCurrentStroke([])}
            className="hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Stroke
          </button>
        </div>
      </div>
    </div>
  );
}
