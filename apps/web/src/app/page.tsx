'use client';

import { useState, useEffect, useRef } from 'react';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || typeof window !== 'undefined' && window.location.hostname.includes('github.io');

export default function Home() {
  const [basePath, setBasePath] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [opencvReady, setOpencvReady] = useState(false);
  const [conversionMode, setConversionMode] = useState<'coloring' | 'dots' | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Set basePath at runtime for GitHub Pages
    let detectedBasePath = '';
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/traceplay')) {
      detectedBasePath = '/traceplay';
    }
    setBasePath(detectedBasePath);

    // Set initial image in demo mode
    if (isDemoMode) {
      const imagePath = `${detectedBasePath}/generated_turtle.png`;
      console.log('Setting initial image:', imagePath);
      setSelectedImage(imagePath);
    }

    // Check if OpenCV is loaded
    const checkOpenCV = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).cv) {
        setOpencvReady(true);
        clearInterval(checkOpenCV);
      }
    }, 100);

    return () => clearInterval(checkOpenCV);
  }, []);

  const handleLoadSampleImage = async () => {
    if (isDemoMode) {
      if (isProcessing) return;
      
      setProcessedImage(false);
      setSelectedImage(`${basePath}/generated_turtle.png`);
      
      if (opencvReady && canvasRef.current) {
        setIsProcessing(true);
        setProcessingStage('Loading image...');
        setEstimatedTime(2);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const cv = (window as any).cv;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `${basePath}/generated_turtle.png`;
          
          img.onerror = () => {
            console.error('Failed to load image:', img.src);
            img.onload = null;
            img.onerror = null;
            setProcessingStage('');
            setIsProcessing(false);
          };

          img.onload = async () => {
            img.onload = null;
            img.onerror = null;
            setProcessingStage('Reading image with OpenCV...');
            await new Promise(resolve => setTimeout(resolve, 100));
            
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
            
            setProcessingStage('Converting to grayscale...');
            setEstimatedTime(1);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Convert to grayscale
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
            
            setProcessingStage('Applying threshold...');
            setEstimatedTime(1);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Apply threshold
            cv.threshold(dst, dst, 127, 255, cv.THRESH_BINARY);
            
            setProcessingStage('Finding contours...');
            setEstimatedTime(2);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            
            setProcessingStage('Drawing contours...');
            setEstimatedTime(1);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Draw contours
            cv.drawContours(src, contours, -1, [0, 255, 0, 255], 2);
            
            setProcessingStage('Rendering result...');
            setEstimatedTime(1);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Display result
            cv.imshow(canvas, src);
            
            // Cleanup
            src.delete();
            dst.delete();
            contours.delete();
            hierarchy.delete();
            
            setProcessingStage('');
            setIsProcessing(false);
            setProcessedImage(true);
          };
        } catch (error) {
          console.error('OpenCV processing error:', error);
          setProcessingStage('');
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

  const handleProcessImage = async () => {
    console.log('handleProcessImage called', { selectedImage, opencvReady, canvasRef: !!canvasRef.current, conversionMode });
    if (!selectedImage || !opencvReady || !canvasRef.current || !conversionMode) {
      console.error('Missing required state:', { 
        hasSelectedImage: !!selectedImage, 
        opencvReady, 
        hasCanvas: !!canvasRef.current, 
        conversionMode 
      });
      return;
    }
    
    console.log('Processing image with URL:', selectedImage);
    setIsProcessing(true);
    setProcessingStage('Loading image...');
    setEstimatedTime(2);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const cv = (window as any).cv;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // selectedImage already includes basePath from initialization
      img.src = selectedImage;
      
      img.onerror = () => {
        console.error('Failed to load image for processing:', img.src);
        setProcessingStage('');
        setIsProcessing(false);
      };
      
      img.onload = async () => {
        setProcessingStage('Reading image with OpenCV...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
        
        setProcessingStage('Converting to grayscale...');
        setEstimatedTime(1);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Convert to grayscale
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        
        setProcessingStage('Applying threshold...');
        setEstimatedTime(1);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Apply threshold
        cv.threshold(dst, dst, 127, 255, cv.THRESH_BINARY);
        
        setProcessingStage('Finding contours...');
        setEstimatedTime(2);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Find contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        
        setProcessingStage('Generating output...');
        setEstimatedTime(2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create white background image
        const white = new cv.Mat();
        cv.cvtColor(src, white, cv.COLOR_RGBA2GRAY, 0);
        white.setTo(new cv.Scalar(255, 255, 255, 255));
        
        if (conversionMode === 'coloring') {
          // Draw contours as black outlines on white background for coloring page
          cv.drawContours(white, contours, -1, [0, 0, 0, 255], 2);
        } else if (conversionMode === 'dots') {
          // Draw black dots at contour points on white background for connect-the-dots
          for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            for (let j = 0; j < contour.rows; j += 10) {
              const point = contour.data32S.subarray(j * 2, j * 2 + 2);
              cv.circle(white, new cv.Point(point[0], point[1]), 3, [0, 0, 0, 255], -1);
            }
          }
        }
        
        setProcessingStage('Rendering result...');
        setEstimatedTime(1);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Display result
        cv.imshow(canvas, white);
        
        // Cleanup
        white.delete();
        
        // Cleanup
        src.delete();
        dst.delete();
        contours.delete();
        hierarchy.delete();
        
        setProcessingStage('');
        setIsProcessing(false);
        setProcessedImage(true);
      };
    } catch (error) {
      console.error('OpenCV processing error:', error);
      setProcessingStage('');
      setIsProcessing(false);
    }
  };


  const handlePrintImage = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Image</title>
              <style>
                @media print {
                  body { margin: 0; padding: 0; }
                  img { max-width: 100%; max-height: 100vh; }
                }
              </style>
            </head>
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
          TracePlay Image Converter
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Convert any image into coloring pages or connect-the-dots activities
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Convert Images to Coloring Pages</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Mode:</strong> This is a frontend-only demo with browser-based OpenCV.js.
                </p>
                <p className="text-sm text-blue-800">
                  OpenCV.js Status: {opencvReady ? '✓ Ready' : '⏳ Loading...'}
                </p>
              </div>
            <div className="mb-4 relative">
              <img 
                id="background-image"
                src={selectedImage || `${basePath}/generated_turtle.png`} 
                alt="Sample image for conversion" 
                className={`${processedImage && !isProcessing ? 'opacity-10' : 'opacity-100'} w-full h-auto rounded-lg border border-gray-200`}
              />
              <canvas 
                ref={canvasRef}
                className={`${processedImage && !isProcessing ? 'block' : 'hidden'} w-full h-auto rounded-lg border border-gray-200 absolute top-0 left-0`}
              />
            </div>
            {isProcessing && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 font-semibold mb-1">
                  {processingStage || 'Processing image with OpenCV.js...'}
                </p>
                {estimatedTime > 0 && (
                  <p className="text-xs text-yellow-700">
                    Estimated time remaining: ~{estimatedTime} second{estimatedTime !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 flex gap-4 flex-wrap">
              <button 
                onClick={handleLoadSampleImage}
                disabled={!opencvReady || isProcessing}
                className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Load Sample Image'}
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
              {(selectedImage || isDemoMode) && (
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
                  {processedImage && !isProcessing && (
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
            </div>
          </div>
      </div>
      
    </main>
  );
}
