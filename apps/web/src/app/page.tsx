'use client';

import { useState } from 'react';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || typeof window !== 'undefined' && window.location.hostname.includes('github.io');

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLoadLesson = () => {
    if (isDemoMode) {
      // In demo mode, just show the sample image
      setSelectedImage('/generated_turtle.png');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to TracePlay
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered interactive learning platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive Tracing</h2>
            <p className="text-gray-600 mb-4">
              Learn by tracing shapes and patterns with real-time feedback
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Adaptive Quizzes</h2>
            <p className="text-gray-600 mb-4">
              AI-generated quizzes that adapt to your learning pace
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Lesson Preview</h2>
          {isDemoMode && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Demo Mode:</strong> This is a frontend-only demo. 
                Full backend integration requires Docker/Kubernetes deployment.
              </p>
            </div>
          )}
          <div className="mb-4">
            <img 
              src={selectedImage || '/generated_turtle.png'} 
              alt="Sample tracing image - turtle" 
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button 
              onClick={handleLoadLesson}
              className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-4 py-2 text-base"
            >
              Load Lesson
            </button>
            <button 
              className="rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 px-4 py-2 text-base"
            >
              View Curriculum
            </button>
          </div>
        </div>

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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-2">Classroom Mode</h3>
            <p className="text-sm text-gray-600">
              Join live sessions with instructors and peers
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
