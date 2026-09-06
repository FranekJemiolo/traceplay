'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  Gamepad2,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  Play,
  Layers,
  CheckCircle,
  HelpCircle,
  Eye,
  Award,
  Compass,
} from 'lucide-react';
import CurriculumView from '../components/CurriculumView';
import TracingGameModal, { TracingShape, TracingStateNotification } from '../components/TracingGameModal';
import ClassroomModal from '../components/ClassroomModal';
import { DemoLesson, getDemoLessonById, demoStorybooks } from '../lib/demoData';

import { TrainingHashState, encodeHashState, decodeHashState } from '../lib/hashState';
import { getPredefinedShapesForImage } from '../lib/predefinedShapes';

export default function Home() {
  const [basePath, setBasePath] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeImageKey, setActiveImageKey] = useState<'turtle' | 'cat_sample' | 'cat_playful' | 'custom'>('cat_sample');
  const [processedImage, setProcessedImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const [conversionMode, setConversionMode] = useState<'coloring' | 'dots' | 'tracing'>('coloring');
  const [processingStage, setProcessingStage] = useState<string>('');

  // Studio Sliders
  const [threshold, setThreshold] = useState<number>(128);
  const [dotSpacing, setDotSpacing] = useState<number>(42);
  const [lineThickness, setLineThickness] = useState<number>(2);

  // Modals state
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string>('lesson-cat-1');
  const [activeLessonTitle, setActiveLessonTitle] = useState('Cute Cat Tracing Adventure');
  const [extractedShapes, setExtractedShapes] = useState<TracingShape[]>([]);

  // Training & Game progression state
  const [gameMode, setGameMode] = useState<'train' | 'studio'>('studio');
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'hard'>('easy');
  const [gameShapeIndex, setGameShapeIndex] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameStars, setGameStars] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);
  const isInitialMount = useRef(true);

  const [isGithubPagesPreview, setIsGithubPagesPreview] = useState(true);

  // Helper to format asset paths for base path
  const getAssetPath = useCallback((path: string, currentBasePath = basePath) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${currentBasePath}${cleanPath}`;
  }, [basePath]);

  // Sync state with URL search parameters
  const updateUrlParams = useCallback((params: Record<string, string | null>) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    window.history.replaceState(null, '', url.toString());
  }, []);

  // Initialization & URL reading
  useEffect(() => {
    let detectedBasePath = '';
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/traceplay')) {
      detectedBasePath = '/traceplay';
    }
    setBasePath(detectedBasePath);

    const isPreview =
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      (typeof window !== 'undefined' && (
        window.location.hostname.includes('github.io') ||
        window.location.pathname.startsWith('/traceplay')
      ));
    setIsGithubPagesPreview(isPreview);

    // Read URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const urlImg = searchParams.get('img');
    const urlMode = searchParams.get('mode') as 'coloring' | 'dots' | 'tracing' | null;
    const urlThreshold = searchParams.get('threshold');
    const urlSpacing = searchParams.get('spacing');
    const urlThickness = searchParams.get('thickness');
    const urlLesson = searchParams.get('lesson');
    const urlGame = searchParams.get('game');
    const urlCurriculum = searchParams.get('curriculum');
    const urlClassroom = searchParams.get('classroom');

    // Initialize mode
    if (urlMode && ['coloring', 'dots', 'tracing'].includes(urlMode)) {
      setConversionMode(urlMode);
    }

    // Initialize sliders
    if (urlThreshold) setThreshold(Number(urlThreshold));
    if (urlSpacing) setDotSpacing(Number(urlSpacing));
    if (urlThickness) setLineThickness(Number(urlThickness));

    // Initialize lesson & image
    let initialImg = `${detectedBasePath}/cat_sample.png`;
    let initialKey: 'turtle' | 'cat_sample' | 'cat_playful' | 'custom' = 'cat_sample';

    if (urlLesson) {
      const foundLesson = getDemoLessonById(urlLesson);
      if (foundLesson) {
        setActiveLessonId(foundLesson.id);
        setActiveLessonTitle(foundLesson.title);
        initialImg = getAssetPath(foundLesson.imageUrl, detectedBasePath);
        if (foundLesson.imageUrl.includes('turtle')) initialKey = 'turtle';
        else if (foundLesson.imageUrl.includes('cat_playful')) initialKey = 'cat_playful';
        else initialKey = 'cat_sample';
      }
    } else if (urlImg) {
      if (urlImg === 'turtle') {
        initialImg = `${detectedBasePath}/generated_turtle.png`;
        initialKey = 'turtle';
      } else if (urlImg === 'cat_playful') {
        initialImg = `${detectedBasePath}/cat_playful.png`;
        initialKey = 'cat_playful';
      } else if (urlImg === 'cat_sample') {
        initialImg = `${detectedBasePath}/cat_sample.png`;
        initialKey = 'cat_sample';
      } else {
        initialImg = urlImg;
        initialKey = 'custom';
      }
    }

    setSelectedImage(initialImg);
    setActiveImageKey(initialKey);

    // Read URL hash state (Base64 encoded content after #)
    const parseHashState = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (hash) {
        const decoded = decodeHashState(hash);
        if (decoded) {
          setGameMode(decoded.mode);
          setGameDifficulty(decoded.diff);
          setGameShapeIndex(decoded.idx);
          setGameScore(decoded.score);
          setGameStars(decoded.stars);
          setIsGameOpen(true);
        }
      }
    };

    parseHashState();
    window.addEventListener('hashchange', parseHashState);

    // Initialize modals
    if (urlGame === '1' || urlGame === 'true') setIsGameOpen(true);
    if (urlCurriculum === '1' || urlCurriculum === 'true') setIsCurriculumOpen(true);
    if (!isPreview && (urlClassroom === '1' || urlClassroom === 'true')) setIsClassroomOpen(true);

    // Check OpenCV readiness
    const checkOpenCV = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).cv && (window as any).cv.Mat) {
        setOpencvReady(true);
        clearInterval(checkOpenCV);
      }
    }, 150);

    return () => {
      window.removeEventListener('hashchange', parseHashState);
      clearInterval(checkOpenCV);
    };
  }, [getAssetPath]);

  const handleOpenTrainingMode = useCallback(() => {
    const initialState: TrainingHashState = {
      mode: 'train',
      diff: 'easy',
      idx: 0,
      score: 0,
      stars: 0,
    };
    setGameMode('train');
    setGameDifficulty('easy');
    setGameShapeIndex(0);
    setGameScore(0);
    setGameStars(0);
    setIsGameOpen(true);
    if (typeof window !== 'undefined') {
      window.location.hash = 'state=' + encodeHashState(initialState);
    }
  }, []);

  const handleOpenStudioGame = useCallback(() => {
    setGameMode('studio');
    setIsGameOpen(true);
    updateUrlParams({ game: '1' });
  }, [updateUrlParams]);

  const handleGameStateChange = useCallback((state: TracingStateNotification) => {
    setGameMode(state.mode);
    setGameDifficulty(state.difficulty);
    setGameShapeIndex(state.shapeIndex);
    setGameScore(state.score);
    setGameStars(state.stars);
    if (typeof window !== 'undefined') {
      window.location.hash =
        'state=' +
        encodeHashState({
          mode: state.mode,
          diff: state.difficulty,
          idx: state.shapeIndex,
          score: state.score,
          stars: state.stars,
        });
    }
  }, []);

  // Pure Canvas Vectorization & Outlines Engine (Guaranteed zero-dependency fallback)
  const processWithCanvasEngine = useCallback(
    (
      img: HTMLImageElement,
      canvas: HTMLCanvasElement,
      mode: 'coloring' | 'dots' | 'tracing',
      threshVal: number,
      spacingVal: number,
      thicknessVal: number
    ): TracingShape[] => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return [];

      const w = img.naturalWidth || img.width || 600;
      const h = img.naturalHeight || img.height || 600;
      canvas.width = w;
      canvas.height = h;

      // Draw source image
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Grayscale and threshold mask
      const binary = new Uint8Array(w * h);
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const pixelIdx = i / 4;
        binary[pixelIdx] = gray < threshVal ? 1 : 0;
      }

      // Edge detection: pixel is 1 and has at least one 0 neighbor
      const edges: Array<{ x: number; y: number }> = [];
      const edgeGrid = new Uint8Array(w * h);

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (binary[idx] === 1) {
            if (
              binary[idx - 1] === 0 ||
              binary[idx + 1] === 0 ||
              binary[idx - w] === 0 ||
              binary[idx + w] === 0
            ) {
              edgeGrid[idx] = 1;
              edges.push({ x, y });
            }
          }
        }
      }

      // Fill canvas with crisp clean white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const generatedShapes: TracingShape[] = [];

      if (mode === 'coloring') {
        // Crisp coloring outlines
        ctx.fillStyle = '#0f172a';
        const halfThick = Math.floor(thicknessVal / 2);
        for (let i = 0; i < edges.length; i++) {
          const { x, y } = edges[i];
          ctx.fillRect(x - halfThick, y - halfThick, thicknessVal, thicknessVal);
        }
      } else if (mode === 'dots' || mode === 'tracing') {
        // Connect-the-dots or tracing worksheet:
        // Enforce generous spacing (min 38px) and cap dots at 16 to avoid clutter and overlap
        const minSpacing = Math.max(38, spacingVal);
        const maxAllowedDots = 16;
        const sampledPoints: Array<{ x: number; y: number }> = [];

        // Sample along edges with strict Euclidean distance check against all chosen points
        for (let i = 0; i < edges.length; i += 2) {
          const pt = edges[i];
          const tooClose = sampledPoints.some(
            (s) => Math.hypot(s.x - pt.x, s.y - pt.y) < minSpacing
          );
          if (!tooClose) {
            sampledPoints.push(pt);
            if (sampledPoints.length >= maxAllowedDots) break;
          }
        }

        // Sort points clockwise / radially from centroid for sequential connect-the-dots
        if (sampledPoints.length > 3) {
          let cx = 0, cy = 0;
          sampledPoints.forEach((p) => { cx += p.x; cy += p.y; });
          cx /= sampledPoints.length;
          cy /= sampledPoints.length;

          sampledPoints.sort((a, b) => {
            const angleA = Math.atan2(a.y - cy, a.x - cx);
            const angleB = Math.atan2(b.y - cy, b.x - cx);
            return angleA - angleB;
          });
        }

        if (mode === 'tracing') {
          // Draw subtle dashed guidelines
          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          sampledPoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        // Draw numbered dots
        sampledPoints.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();

          // Small dot number
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((idx + 1).toString(), pt.x, pt.y - 8);
        });

        if (sampledPoints.length >= 4) {
          generatedShapes.push({
            label: `${activeLessonTitle || 'Activity'} Contour`,
            points: sampledPoints,
          });
        }
      }

      return generatedShapes;
    },
    [activeLessonTitle]
  );

  // Main Image Processor (Hybrid OpenCV + Pure Canvas fallback)
  const handleProcessImage = useCallback(
    async (
      targetMode: 'coloring' | 'dots' | 'tracing' = conversionMode,
      targetImage: string = selectedImage
    ) => {
      if (!targetImage || !canvasRef.current) return;

      setIsProcessing(true);
      setProcessingStage('Analyzing image contours...');

      const canvas = canvasRef.current;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = targetImage;

      img.onerror = () => {
        console.error('Failed to load image:', targetImage);
        setIsProcessing(false);
        setProcessingStage('');
      };

      img.onload = async () => {
        try {
          let extracted: TracingShape[] = [];
          const predefined = getPredefinedShapesForImage(
            activeImageKey !== 'custom' ? activeImageKey : targetImage
          );

          // For predefined images (sea turtle, cats), render curated dots directly in dots/tracing modes
          // to eliminate background landscape noise (trees/clouds) and guarantee clean non-overlapping dots
          if (activeImageKey !== 'custom' && (targetMode === 'dots' || targetMode === 'tracing')) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const w = img.naturalWidth || img.width || 600;
              const h = img.naturalHeight || img.height || 600;
              canvas.width = w;
              canvas.height = h;

              // White worksheet canvas
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, w, h);

              predefined.forEach((shape) => {
                if (targetMode === 'tracing') {
                  ctx.save();
                  ctx.setLineDash([6, 6]);
                  ctx.strokeStyle = '#94a3b8';
                  ctx.lineWidth = 2.5;
                  ctx.beginPath();
                  shape.points.forEach((p, idx) => {
                    const sx = (p.x / 600) * w;
                    const sy = (p.y / 480) * h;
                    if (idx === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                  });
                  ctx.closePath();
                  ctx.stroke();
                  ctx.restore();
                }

                shape.points.forEach((p, idx) => {
                  const sx = (p.x / 600) * w;
                  const sy = (p.y / 480) * h;
                  ctx.beginPath();
                  ctx.arc(sx, sy, 5, 0, Math.PI * 2);
                  ctx.fillStyle = '#1e293b';
                  ctx.fill();

                  ctx.fillStyle = '#475569';
                  ctx.font = 'bold 11px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.fillText((idx + 1).toString(), sx, sy - 9);
                });
              });
            }
            extracted = predefined;
          } else {
            // If OpenCV is loaded, try using OpenCV contours
            const cv = typeof window !== 'undefined' ? (window as any).cv : null;
            if (cv && cv.Mat && cv.imread) {
              try {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);

                  const src = cv.imread(canvas);
                  const gray = new cv.Mat();
                  const binary = new cv.Mat();
                  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
                  cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY_INV);

                  const contours = new cv.MatVector();
                  const hierarchy = new cv.Mat();
                  cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                  const white = new cv.Mat();
                  cv.cvtColor(src, white, cv.COLOR_RGBA2GRAY, 0);
                  white.setTo(new cv.Scalar(255, 255, 255, 255));

                  if (targetMode === 'coloring') {
                    cv.drawContours(white, contours, -1, new cv.Scalar(15, 23, 42, 255), lineThickness);
                  } else {
                    const minSpacing = Math.max(38, dotSpacing);
                    const maxAllowedDots = 16;
                    for (let i = 0; i < contours.size(); i++) {
                      const cnt = contours.get(i);
                      const peri = cv.arcLength(cnt, true);
                      if (peri < 80) continue; // Skip tiny noise contours

                      const pts: { x: number; y: number }[] = [];
                      for (let j = 0; j < cnt.rows; j++) {
                        const pt = cnt.data32S.subarray(j * 2, j * 2 + 2);
                        const candidate = { x: pt[0], y: pt[1] };
                        const tooClose = pts.some(
                          (p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) < minSpacing
                        );
                        if (!tooClose) {
                          pts.push(candidate);
                          cv.circle(white, new cv.Point(candidate.x, candidate.y), 4.5, new cv.Scalar(30, 41, 59, 255), -1);
                          if (pts.length >= maxAllowedDots) break;
                        }
                      }
                      if (pts.length >= 4) {
                        extracted.push({ label: `Contour #${i + 1}`, points: pts });
                        if (extracted.length >= 2) break; // Avoid overcrowding with too many contours
                      }
                    }
                  }

                  cv.imshow(canvas, white);

                  // Clean up OpenCV Mats
                  src.delete();
                  gray.delete();
                  binary.delete();
                  contours.delete();
                  hierarchy.delete();
                  white.delete();
                }
              } catch (cvErr) {
                console.warn('OpenCV processing threw, falling back to Canvas engine:', cvErr);
                extracted = processWithCanvasEngine(img, canvas, targetMode, threshold, dotSpacing, lineThickness);
              }
            } else {
              // Direct Pure Canvas Engine
              extracted = processWithCanvasEngine(img, canvas, targetMode, threshold, dotSpacing, lineThickness);
            }

            // In coloring mode for predefined characters, use predefined shapes for interactive game
            if (activeImageKey !== 'custom' && predefined.length > 0) {
              extracted = predefined;
            }
          }

          if (extracted.length > 0) {
            setExtractedShapes(extracted);
          }
          setProcessedImage(true);
        } catch (err) {
          console.error('Processing error:', err);
        } finally {
          setIsProcessing(false);
          setProcessingStage('');
        }
      };
    },
    [conversionMode, selectedImage, threshold, dotSpacing, lineThickness, processWithCanvasEngine]
  );

  // Trigger processing when selectedImage or conversionMode changes
  useEffect(() => {
    if (selectedImage) {
      handleProcessImage(conversionMode, selectedImage);
    }
  }, [selectedImage, conversionMode]);

  // Mode Selection Helper
  const handleModeSelect = (mode: 'coloring' | 'dots' | 'tracing') => {
    setConversionMode(mode);
    updateUrlParams({ mode });
    handleProcessImage(mode, selectedImage);
  };

  // Image Selection Helper
  const handleSelectPredefinedImage = (key: 'turtle' | 'cat_sample' | 'cat_playful', filename: string) => {
    const fullPath = `${basePath}/${filename}`;
    setSelectedImage(fullPath);
    setActiveImageKey(key);
    updateUrlParams({ img: key });
  };

  // Image Upload Helper
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setActiveImageKey('custom');
        updateUrlParams({ img: 'custom' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Curriculum Lesson Start Helper
  const handleStartLessonFromCurriculum = (lesson: DemoLesson) => {
    setIsCurriculumOpen(false);
    setActiveLessonId(lesson.id);
    setActiveLessonTitle(lesson.title);
    const lessonImgPath = getAssetPath(lesson.imageUrl);
    setSelectedImage(lessonImgPath);

    if (lesson.imageUrl.includes('turtle')) setActiveImageKey('turtle');
    else if (lesson.imageUrl.includes('cat_playful')) setActiveImageKey('cat_playful');
    else setActiveImageKey('cat_sample');

    updateUrlParams({
      lesson: lesson.id,
      img: lesson.imageUrl.includes('turtle') ? 'turtle' : lesson.imageUrl.includes('cat_playful') ? 'cat_playful' : 'cat_sample',
      game: '1',
    });

    setIsGameOpen(true);
  };

  // Sliders change handlers with URL sync
  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    updateUrlParams({ threshold: val.toString() });
  };

  const handleDotSpacingChange = (val: number) => {
    setDotSpacing(val);
    updateUrlParams({ spacing: val.toString() });
  };

  const handleLineThicknessChange = (val: number) => {
    setLineThickness(val);
    updateUrlParams({ thickness: val.toString() });
  };

  const handlePrintWorksheet = () => {
    if (canvasRef.current && printCanvasRef.current) {
      const pCanvas = printCanvasRef.current;
      const ctx = pCanvas.getContext('2d');
      if (ctx) {
        pCanvas.width = canvasRef.current.width;
        pCanvas.height = canvasRef.current.height;
        ctx.drawImage(canvasRef.current, 0, 0);
      }
    }
    window.print();
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `traceplay-${conversionMode}-worksheet.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Trace<span className="text-indigo-600">Play</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Studio
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600">
            <button
              onClick={handleOpenTrainingMode}
              className="px-3.5 py-2 rounded-xl hover:text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1.5 text-amber-700 font-bold bg-amber-500/10 border border-amber-500/20"
            >
              <Compass className="w-4 h-4 text-amber-500" /> Train Mode
            </button>
            <button
              onClick={handleOpenStudioGame}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 text-indigo-500" /> Tracing Game
            </button>
            <button
              onClick={() => {
                setIsCurriculumOpen(true);
                updateUrlParams({ curriculum: '1' });
              }}
              className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-violet-500" /> Curriculum
            </button>
            {!isGithubPagesPreview && (
              <button
                onClick={() => {
                  setIsClassroomOpen(true);
                  updateUrlParams({ classroom: '1' });
                }}
                className="px-3.5 py-2 rounded-xl hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-emerald-500" /> Live Classroom
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {opencvReady ? 'Vision Engine Active' : 'Canvas Engine Ready'}
            </div>

            <button
              onClick={handleOpenStudioGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" /> Play Game
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
        {/* Hero Banner with Instant Conversion Buttons */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-violet-500/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Activity & Tracing Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Transform Any Photo into Interactive Tracing Activities
            </h1>
            <p className="mt-2 text-indigo-200 text-sm sm:text-base">
              Convert pictures into coloring book outlines, connect-the-dots worksheets, and interactive drawing games for young learners.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleModeSelect('coloring')}
                disabled={isProcessing}
                className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 ${
                  conversionMode === 'coloring'
                    ? 'bg-white text-indigo-900 ring-2 ring-indigo-400 shadow-lg'
                    : 'bg-indigo-800/80 hover:bg-indigo-700 text-white border border-indigo-600'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600" /> Convert to Coloring Page
              </button>

              <button
                onClick={() => handleModeSelect('dots')}
                disabled={isProcessing}
                className={`font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
                  conversionMode === 'dots'
                    ? 'bg-white text-indigo-900 ring-2 ring-indigo-400 shadow-lg'
                    : 'bg-indigo-800/80 hover:bg-indigo-700 text-white border border-indigo-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-300" /> Connect the Dots
              </button>

              <button
                onClick={handleOpenTrainingMode}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/30 flex items-center gap-2"
              >
                <Compass className="w-4 h-4" /> Train Shapes (Progression)
              </button>

              <button
                onClick={handleOpenStudioGame}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" /> Trace in Interactive Game
              </button>
            </div>
          </div>
        </div>

        {/* Activity Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls & Options Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" /> Studio Controls
              </h2>
              <p className="text-xs text-slate-500 mt-1">Configure your image and conversion preferences</p>
            </div>

            {/* Source Image Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Source Image
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectPredefinedImage('cat_sample', 'cat_sample.png')}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    activeImageKey === 'cat_sample'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🐱 Cute Cat
                </button>

                <button
                  onClick={() => handleSelectPredefinedImage('cat_playful', 'cat_playful.png')}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    activeImageKey === 'cat_playful'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🧶 Playful Kitten
                </button>

                <button
                  onClick={() => handleSelectPredefinedImage('turtle', 'generated_turtle.png')}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    activeImageKey === 'turtle'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🐢 Sea Turtle
                </button>

                <label
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeImageKey === 'custom'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Mode Selectors */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Activity Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleModeSelect('coloring')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    conversionMode === 'coloring'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🖍️ Coloring
                </button>
                <button
                  onClick={() => handleModeSelect('dots')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    conversionMode === 'dots'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🔢 Dots
                </button>
                <button
                  onClick={() => handleModeSelect('tracing')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    conversionMode === 'tracing'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  ✍️ Tracing
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Threshold Sensitivity</span>
                  <span className="text-indigo-600 font-mono">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={threshold}
                  onChange={(e) => handleThresholdChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {conversionMode === 'dots' && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Dot Spacing Frequency</span>
                    <span className="text-indigo-600 font-mono">{dotSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="65"
                    value={dotSpacing}
                    onChange={(e) => handleDotSpacingChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}

              {conversionMode === 'coloring' && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Outline Line Width</span>
                    <span className="text-indigo-600 font-mono">{lineThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={lineThickness}
                    onChange={(e) => handleLineThicknessChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Re-apply Action Button */}
            <button
              onClick={() => handleProcessImage(conversionMode, selectedImage)}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? processingStage || 'Processing...' : 'Apply & Regenerate'}
            </button>
          </div>

          {/* Interactive Workspace Viewport */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Worksheet Preview</h2>
                  <p className="text-xs text-slate-500">
                    {conversionMode === 'coloring'
                      ? 'Clean coloring book outline'
                      : conversionMode === 'dots'
                      ? 'Sequential numbered connect-the-dots'
                      : 'Guided tracing lines'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsGameOpen(true);
                      updateUrlParams({ game: '1' });
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-indigo-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" /> Trace in Game
                  </button>
                  <button
                    onClick={handlePrintWorksheet}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>

              {/* Viewport Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Original Photo Preview */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 text-center">
                  <span className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                    Original Source
                  </span>
                  <div className="relative aspect-square max-h-[360px] mx-auto rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Source for conversion"
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image loaded</span>
                    )}
                  </div>
                </div>

                {/* Processed Vector Activity Canvas */}
                <div className="border-2 border-indigo-100 rounded-2xl p-3 bg-white text-center shadow-inner">
                  <span className="text-xs font-bold text-indigo-600 mb-2 block uppercase tracking-wider">
                    {conversionMode === 'coloring'
                      ? 'Coloring Outline'
                      : conversionMode === 'dots'
                      ? 'Connect-The-Dots Activity'
                      : 'Tracing Guide'}
                  </span>
                  <div className="relative aspect-square max-h-[360px] mx-auto rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
                    <canvas ref={canvasRef} className="object-contain w-full h-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Curriculum Explorer Banner */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Educational Curriculum & Skill Modules</h3>
                  <p className="text-xs text-slate-500">
                    Structured lessons featuring cats, turtles, and nature outlines with progressive difficulty.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCurriculumOpen(true);
                  updateUrlParams({ curriculum: '1' });
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                Browse Lessons <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Printable Worksheet View (Visible ONLY when printing!) */}
      <div className="print-only hidden p-8 bg-white text-black">
        <div className="border-4 border-slate-900 rounded-2xl p-8 max-w-3xl mx-auto flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight uppercase">TracePlay Activity Worksheet</h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {conversionMode === 'coloring'
                  ? 'Color the picture inside the lines!'
                  : 'Connect the numbered dots in order!'}
              </p>
            </div>
            <div className="text-right text-sm font-bold space-y-1">
              <div>Name: ______________________</div>
              <div>Date: _______________________</div>
            </div>
          </div>

          <div className="my-6 border border-slate-300 p-4 rounded-xl">
            <canvas ref={printCanvasRef} className="max-w-full max-h-[500px]" />
          </div>

          <div className="w-full border-t border-slate-300 pt-4 text-xs text-slate-500 flex justify-between">
            <span>Powered by TracePlay Educational Platform</span>
            <span>www.traceplay.com</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCurriculumOpen && (
        <CurriculumView
          onClose={() => {
            setIsCurriculumOpen(false);
            updateUrlParams({ curriculum: null });
          }}
          onStartLesson={handleStartLessonFromCurriculum}
          activeLessonId={activeLessonId}
        />
      )}

      <TracingGameModal
        isOpen={isGameOpen}
        onClose={() => {
          setIsGameOpen(false);
          updateUrlParams({ game: null });
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
        lessonTitle={gameMode === 'train' ? 'Guided Training Progression' : activeLessonTitle}
        imageUrl={selectedImage}
        shapes={gameMode === 'train' ? undefined : (extractedShapes.length > 0 ? extractedShapes : undefined)}
        mode={gameMode}
        initialDifficulty={gameDifficulty}
        initialShapeIndex={gameShapeIndex}
        initialScore={gameScore}
        initialStars={gameStars}
        onStateChange={handleGameStateChange}
      />

      {!isGithubPagesPreview && (
        <ClassroomModal
          isOpen={isClassroomOpen}
          onClose={() => {
            setIsClassroomOpen(false);
            updateUrlParams({ classroom: null });
          }}
        />
      )}
    </div>
  );
}
