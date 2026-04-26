'use client';

import { Button, Card, Progress } from '@traceplay/ui';
import { TracePlay } from '@traceplay/embed-sdk';
import { useEffect, useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracePlayRef = useRef<TracePlay | null>(null);

  useEffect(() => {
    if (containerRef.current && !tracePlayRef.current) {
      tracePlayRef.current = new TracePlay({
        apiKey: process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        mode: 'lesson',
      });

      tracePlayRef.current.mount(containerRef.current, {
        width: '100%',
        height: '500px',
        theme: 'light',
      });
    }

    return () => {
      tracePlayRef.current?.destroy();
    };
  }, []);

  const handleLoadLesson = () => {
    tracePlayRef.current?.loadLesson('lesson-1');
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
          <div className="mb-4">
            <img 
              src="/generated_turtle.png" 
              alt="Sample tracing image - turtle" 
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
          <div ref={containerRef} className="w-full" />
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
