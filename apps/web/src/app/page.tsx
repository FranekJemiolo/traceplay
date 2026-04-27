'use client';

import { useState, useEffect, useRef } from 'react';
import { getFeatureFlags, FeatureFlags } from '../config/featureFlags';
import CurriculumView from '../components/CurriculumView';

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/traceplay' : '';
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGitHubPages;

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(getFeatureFlags());
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [conversionMode, setConversionMode] = useState<'coloring' | 'dots' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if OpenCV is loaded
    const checkOpenCV = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).cv) {
        setOpencvReady(true);
        clearInterval(checkOpenCV);
      }
    }, 100);

    return () => clearInterval(checkOpenCV);
  }, []);

  const handleLoadLesson = async () => {
    if (isDemoMode) {
      setSelectedImage(`${basePath}/generated_turtle.png`);
      
      if (opencvReady && canvasRef.current) {
        setIsProcessing(true);
        try {
          const cv = (window as any).cv;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `${basePath}/generated_turtle.png`;
          
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Read image with OpenCV
            const src = cv.imread(canvas);
            const dst = new cv.Mat();
            
            // Convert to grayscale
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
            
            // Apply threshold
            cv.threshold(dst, dst, 127, 255, cv.THRESH_BINARY);
            
            // Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            
            // Draw contours
            cv.drawContours(src, contours, -1, [0, 255, 0, 255], 2);
            
            // Display result
            cv.imshow(canvas, src);
            
            // Cleanup
            src.delete();
            dst.delete();
            contours.delete();
            hierarchy.delete();
            
            setIsProcessing(false);
          };
        } catch (error) {
          console.error('OpenCV processing error:', error);
          setIsProcessing(false);
        }
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && opencvReady && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage(e.target?.result as string);
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = () => {
    if (!selectedImage || !opencvReady || !canvasRef.current || !conversionMode) return;
    
    setIsProcessing(true);
    try {
      const cv = (window as any).cv;
      const img = new Image();
      img.src = selectedImage;
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Read image with OpenCV
        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        
        // Convert to grayscale
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        
        // Apply threshold
        cv.threshold(dst, dst, 127, 255, cv.THRESH_BINARY);
        
        // Find contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        
        if (conversionMode === 'coloring') {
          // Draw contours as outlines for coloring page
          cv.drawContours(src, contours, -1, [0, 0, 0, 255], 2);
        } else if (conversionMode === 'dots') {
          // Draw dots at contour points for connect-the-dots
          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            for (let j = 0; j < contour.rows; j += 10) {
              const point = contour.data32S.subarray(j * 2, j * 2 + 2);
              cv.circle(src, new cv.Point(point[0], point[1]), 3, [0, 0, 0, 255], -1);
            }
          }
        }
        
        // Display result
        cv.imshow(canvas, src);
        
        // Cleanup
        src.delete();
        dst.delete();
        contours.delete();
        hierarchy.delete();
        
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('OpenCV processing error:', error);
      setIsProcessing(false);
    }
  };

  const handleViewCurriculum = () => {
    if (isDemoMode) {
      setShowCurriculum(true);
    }
  };

  const handleInteractiveTracing = () => {
    if (isDemoMode) {
      alert('Demo Mode: Interactive Tracing\n\nIn the full version, this would launch:\n- Phaser-based tracing game\n- Real-time shape recognition\n- Progress tracking\n\nThis feature requires the backend game server.');
    }
  };

  const handleAdaptiveQuizzes = () => {
    if (isDemoMode) {
      alert('Demo Mode: Adaptive Quizzes\n\nIn the full version, this would provide:\n- AI-generated quizzes\n- Adaptive difficulty\n- Performance analytics\n\nThis feature requires the backend AI service.');
    }
  };

  const handleClassroomMode = () => {
    if (isDemoMode) {
      alert('Demo Mode: Classroom Mode\n\nIn the full version, this would enable:\n- Live instructor sessions\n- Real-time collaboration\n- WebSocket-based interactions\n\nThis feature requires the backend WebSocket server.');
    }
  };

  const handlePrintImage = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print Image</title></head>
            <body style="margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              <img src="${dataUrl}" style="max-width:100%;max-height:100vh;" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleSaveImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `traceplay-${conversionMode || 'image'}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to TracePlay Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered interactive learning platform
        </p>

        {featureFlags.interactiveTracing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={handleInteractiveTracing}
            >
              <h2 className="text-xl font-semibold mb-4">Interactive Tracing</h2>
              <p className="text-gray-600 mb-4">
                Learn by tracing shapes and patterns with real-time feedback
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            {featureFlags.adaptiveQuizzes && (
              <div 
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleAdaptiveQuizzes}
              >
                <h2 className="text-xl font-semibold mb-4">Adaptive Quizzes</h2>
                <p className="text-gray-600 mb-4">
                  AI-generated quizzes that adapt to your learning pace
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
        {featureFlags.lessonPreview && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Lesson Preview</h2>
            {isDemoMode && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Mode:</strong> This is a frontend-only demo with browser-based OpenCV.js. 
                  Full backend integration requires Docker/Kubernetes deployment.
                </p>
                <p className="text-sm text-blue-800">
                  OpenCV.js Status: {opencvReady ? '✓ Ready' : '⏳ Loading...'}
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Active Features: {Object.entries(featureFlags)
                    .filter(([_, enabled]) => enabled)
                    .map(([key]) => key)
                    .join(', ')}
                </p>
              </div>
            )}
            <div className="mb-4">
              {selectedImage && !isProcessing ? (
                <canvas 
                  ref={canvasRef}
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              ) : (
                <img 
                  src={selectedImage || `${basePath}/generated_turtle.png`} 
                  alt="Sample tracing image - turtle" 
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              )}
            </div>
            {isProcessing && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Processing image with OpenCV.js...
                </p>
              </div>
            )}
            <div className="mt-4 flex gap-4 flex-wrap">
              <button 
                onClick={handleLoadLesson}
                disabled={!opencvReady || isProcessing}
                className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Load Sample Lesson'}
              </button>
              <label className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 px-4 py-2 text-base cursor-pointer">
                Upload Image
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">Convert to:</span>
                    <button 
                      onClick={() => setConversionMode('coloring')}
                      disabled={!opencvReady || isProcessing}
                      className={`rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                        conversionMode === 'coloring' 
                          ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                          : 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
                      }`}
                    >
                      Coloring Page
                    </button>
                    <button 
                      onClick={() => setConversionMode('dots')}
                      disabled={!opencvReady || isProcessing}
                      className={`rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                        conversionMode === 'dots' 
                          ? 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500' 
                          : 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500'
                      }`}
                    >
                      Connect Dots
                    </button>
                  </div>
                  {conversionMode && (
                    <button 
                      onClick={handleProcessImage}
                      disabled={!opencvReady || isProcessing}
                      className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Generate'}
                    </button>
                  )}
                  {selectedImage && !isProcessing && (
                    <>
                      <button 
                        onClick={handlePrintImage}
                        className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500 px-4 py-2 text-base"
                      >
                        Print
                      </button>
                      <button 
                        onClick={handleSaveImage}
                        className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500 px-4 py-2 text-base"
                      >
                        Save
                      </button>
                    </>
                  )}
                </>
              )}
              {featureFlags.curriculumManagement && (
                <button 
                  onClick={handleViewCurriculum}
                  className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500 px-4 py-2 text-base"
                >
                  View Curriculum
                </button>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Learn the basics of tracing and shape recognition
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-2">Advanced Techniques</h3>
            <p className="text-sm text-gray-600">
              Master complex patterns and artistic tracing
            </p>
          </div>
          {featureFlags.classroomMode && (
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={handleClassroomMode}
            >
              <h3 className="font-semibold mb-2">Classroom Mode</h3>
              <p className="text-sm text-gray-600">
                Join live sessions with instructors and peers
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showCurriculum && <CurriculumView onClose={() => setShowCurriculum(false)} />}
    </main>
  );
}
