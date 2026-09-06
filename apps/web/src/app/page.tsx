'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import CurriculumView from '../components/CurriculumView';
import TracingGameModal from '../components/TracingGameModal';
import ClassroomModal from '../components/ClassroomModal';
import { DemoLesson } from '../lib/demoData';

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('github.io'));

export default function Home() {
  const [basePath, setBasePath] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const [conversionMode, setConversionMode] = useState<'coloring' | 'dots' | 'tracing'>('coloring');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  // Studio Sliders
  const [threshold, setThreshold] = useState<number>(128);
  const [dotSpacing, setDotSpacing] = useState<number>(18);
  const [lineThickness, setLineThickness] = useState<number>(2);

  // Modals state
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [activeLessonTitle, setActiveLessonTitle] = useState('Image Tracing Adventure');
  const [extractedShapes, setExtractedShapes] = useState<Array<{ label: string; points: { x: number; y: number }[] }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let detectedBasePath = '';
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/traceplay')) {
      detectedBasePath = '/traceplay';
    }
    setBasePath(detectedBasePath);

    const imagePath = `${detectedBasePath}/generated_turtle.png`;
    setSelectedImage(imagePath);

    const checkOpenCV = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).cv) {
        setOpencvReady(true);
        clearInterval(checkOpenCV);
      }
    }, 100);

    return () => clearInterval(checkOpenCV);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setProcessedImage(false);

        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async (mode = conversionMode) => {
    if (!selectedImage || !opencvReady || !canvasRef.current) return;

    setIsProcessing(true);
    setProcessingStage('Reading image with OpenCV...');
    setEstimatedTime(1);
    await new Promise((r) => setTimeout(r, 80));

    try {
      const cv = (window as any).cv;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImage;

      img.onerror = () => {
        console.error('Failed to load image for processing:', img.src);
        setProcessingStage('');
        setIsProcessing(false);
      };

      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        setProcessingStage('Extracting vector contours...');
        await new Promise((r) => setTimeout(r, 50));

        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        const binary = new cv.Mat();

        // Convert to grayscale and threshold
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY_INV);

        // Find contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        setProcessingStage('Synthesizing worksheet artwork...');
        await new Promise((r) => setTimeout(r, 50));

        // Create crisp white canvas
        const output = new cv.Mat(src.rows, src.cols, cv.CV_8UC4, new cv.Scalar(255, 255, 255, 255));

        const detectedShapeList: Array<{ label: string; points: { x: number; y: number }[] }> = [];

        if (mode === 'coloring') {
          // Sharp black outlines for coloring book
          cv.drawContours(output, contours, -1, [15, 23, 42, 255], lineThickness);
        } else if (mode === 'dots' || mode === 'tracing') {
          // Connect the dots or tracing exercise
          const dotStep = Math.max(8, dotSpacing);

          for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const shapePts: { x: number; y: number }[] = [];

            if (mode === 'tracing') {
              // Draw light dashed guideline
              cv.drawContours(output, contours, i, [148, 163, 184, 255], 1);
            }

            for (let j = 0; j < cnt.rows; j += dotStep) {
              const pt = cnt.data32S.subarray(j * 2, j * 2 + 2);
              const x = pt[0];
              const y = pt[1];
              shapePts.push({ x, y });

              // Draw solid connect dot
              cv.circle(output, new cv.Point(x, y), 3, [30, 41, 59, 255], -1);
            }

            if (shapePts.length >= 3) {
              detectedShapeList.push({
                label: `Contour #${i + 1}`,
                points: shapePts,
              });
            }
          }
        }

        cv.imshow(canvas, output);

        // Clean up mats
        src.delete();
        gray.delete();
        binary.delete();
        contours.delete();
        hierarchy.delete();
        output.delete();

        if (detectedShapeList.length > 0) {
          setExtractedShapes(detectedShapeList);
        }

        setProcessingStage('');
        setIsProcessing(false);
        setProcessedImage(true);
      };
    } catch (err) {
      console.error('Processing error:', err);
      setProcessingStage('');
      setIsProcessing(false);
    }
  };

  const handlePrintWorksheet = () => {
    if (canvasRef.current) {
      window.print();
    }
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `traceplay-${conversionMode}-worksheet.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const handleStartLessonFromCurriculum = (lesson: DemoLesson) => {
    setIsCurriculumOpen(false);
    setActiveLessonTitle(lesson.title);
    setSelectedImage(lesson.imageUrl || `${basePath}/generated_turtle.png`);
    setIsGameOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Trace<span className="text-indigo-600">Play</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Studio
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setIsGameOpen(true)}
              className="px-3.5 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 text-indigo-500" /> Tracing Game
            </button>
            <button
              onClick={() => setIsCurriculumOpen(true)}
              className="px-3.5 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-violet-500" /> Curriculum
            </button>
            <button
              onClick={() => setIsClassroomOpen(true)}
              className="px-3.5 py-2 rounded-lg hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-emerald-500" /> Live Classroom
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {opencvReady ? 'OpenCV.js Engine Ready' : 'Loading Vision Engine...'}
            </div>

            <button
              onClick={() => setIsGameOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" /> Play Game
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
        {/* Hero Banner */}
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
                onClick={() => handleProcessImage('coloring')}
                disabled={!opencvReady || isProcessing}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-indigo-600" /> Convert to Coloring Page
              </button>
              <button
                onClick={() => handleProcessImage('dots')}
                disabled={!opencvReady || isProcessing}
                className="bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all border border-indigo-500/40 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-300" /> Connect the Dots
              </button>
            </div>
          </div>
        </div>

        {/* Activity Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls & Options Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" /> Studio Controls
              </h2>
              <p className="text-xs text-slate-500 mt-1">Configure your image and conversion preferences</p>
            </div>

            {/* Image Sources */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Source Image
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedImage(`${basePath}/generated_turtle.png`);
                    setProcessedImage(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  🐢 Turtle
                </button>

                <button
                  onClick={() => {
                    setSelectedImage(`${basePath}/cat_sample.png`);
                    setProcessedImage(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  🐱 Cute Cat
                </button>

                <button
                  onClick={() => {
                    setSelectedImage(`${basePath}/cat_playful.png`);
                    setProcessedImage(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  🧶 Playful Kitten
                </button>

                <label className="px-3 py-2 text-xs font-semibold rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50 cursor-pointer transition-colors flex items-center justify-center gap-1.5">
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
                  onClick={() => {
                    setConversionMode('coloring');
                    handleProcessImage('coloring');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    conversionMode === 'coloring'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🖍️ Coloring
                </button>
                <button
                  onClick={() => {
                    setConversionMode('dots');
                    handleProcessImage('dots');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    conversionMode === 'dots'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  🔢 Dots
                </button>
                <button
                  onClick={() => {
                    setConversionMode('tracing');
                    handleProcessImage('tracing');
                  }}
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
                  <span className="text-indigo-600">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {conversionMode === 'dots' && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Dot Spacing Frequency</span>
                    <span className="text-indigo-600">{dotSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    value={dotSpacing}
                    onChange={(e) => setDotSpacing(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}

              {conversionMode === 'coloring' && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Outline Line Width</span>
                    <span className="text-indigo-600">{lineThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={lineThickness}
                    onChange={(e) => setLineThickness(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleProcessImage(conversionMode)}
              disabled={!opencvReady || isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? processingStage || 'Processing...' : 'Apply & Regenerate'}
            </button>
          </div>

          {/* Interactive Workspace Viewport */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Worksheet Preview</h2>
                  <p className="text-xs text-slate-500">Live vector outline generated by OpenCV.js</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsGameOpen(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-indigo-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" /> Trace in Game
                  </button>
                  <button
                    onClick={handlePrintWorksheet}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>

              {/* Viewport Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Original Photo Preview */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
                  <span className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                    Original Source
                  </span>
                  <div className="relative aspect-square max-h-[360px] mx-auto rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    <img
                      src={selectedImage || `${basePath}/generated_turtle.png`}
                      alt="Source for conversion"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>

                {/* Processed Vector Activity Canvas */}
                <div className="border-2 border-indigo-100 rounded-xl p-3 bg-white text-center shadow-inner">
                  <span className="text-xs font-bold text-indigo-600 mb-2 block uppercase tracking-wider">
                    {conversionMode === 'coloring'
                      ? 'Coloring Outline'
                      : conversionMode === 'dots'
                      ? 'Connect-The-Dots Activity'
                      : 'Tracing Guide'}
                  </span>
                  <div className="relative aspect-square max-h-[360px] mx-auto rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
                    <canvas ref={canvasRef} className="object-contain w-full h-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Curriculum / Storybook Explorer Banner */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Explore Curriculum & Skill Tree</h3>
                  <p className="text-xs text-slate-500">
                    Over 12+ structured tracing lessons with beginner to advanced skill dependencies.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCurriculumOpen(true)}
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
          onClose={() => setIsCurriculumOpen(false)}
          onStartLesson={handleStartLessonFromCurriculum}
        />
      )}

      <TracingGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        lessonTitle={activeLessonTitle}
        shapes={extractedShapes.length > 0 ? extractedShapes : undefined}
      />

      <ClassroomModal isOpen={isClassroomOpen} onClose={() => setIsClassroomOpen(false)} />
    </div>
  );
}
