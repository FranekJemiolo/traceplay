'use client';

import { Button, Card, Progress } from '@traceplay/ui';
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
          <Card>
            <h2 className="text-xl font-semibold mb-4">Interactive Tracing</h2>
            <p className="text-gray-600 mb-4">
              Learn by tracing shapes and patterns with real-time feedback
            </p>
            <Progress value={65} />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Adaptive Quizzes</h2>
            <p className="text-gray-600 mb-4">
              AI-generated quizzes that adapt to your learning pace
            </p>
            <Progress value={40} />
          </Card>
        </div>

        <Card className="mb-8">
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
            <Button onClick={handleLoadLesson}>Load Lesson</Button>
            <Button variant="outline">View Curriculum</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Learn the basics of tracing and shape recognition
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Advanced Techniques</h3>
            <p className="text-sm text-gray-600">
              Master complex patterns and artistic tracing
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Classroom Mode</h3>
            <p className="text-sm text-gray-600">
              Join live sessions with instructors and peers
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
