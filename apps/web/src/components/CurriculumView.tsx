'use client';

import { useState } from 'react';
import { demoCurriculum, DemoModule, DemoLesson } from '../lib/demoData';

export default function CurriculumView({ onClose }: { onClose: () => void }) {
  const [selectedModule, setSelectedModule] = useState<DemoModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<DemoLesson | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{demoCurriculum.title}</h2>
            <p className="text-gray-600 mt-1">{demoCurriculum.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{demoCurriculum.modules.length}</div>
                <div className="text-sm text-gray-600">Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{demoCurriculum.totalLessons}</div>
                <div className="text-sm text-gray-600">Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{demoCurriculum.totalSkills}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
            </div>
          </div>

          {selectedLesson ? (
            <div className="animate-fade-in">
              <button
                onClick={() => setSelectedLesson(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to {selectedModule?.title}
              </button>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                      selectedLesson.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      selectedLesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedLesson.difficulty}
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>⏱ {selectedLesson.estimatedTime} min</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{selectedLesson.description}</p>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Lesson Preview</div>
                  <img
                    src={selectedLesson.imageUrl}
                    alt={selectedLesson.title}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Demo Mode: Lesson would load in full version')}
                >
                  Start Lesson
                </button>
              </div>
            </div>
          ) : selectedModule ? (
            <div className="animate-fade-in">
              <button
                onClick={() => setSelectedModule(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to Curriculum
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedModule.title}</h3>
              <p className="text-gray-600 mb-4">{selectedModule.description}</p>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Skills Covered:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedModule.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedModule.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{lesson.estimatedTime} min</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {demoCurriculum.modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                      <p className="text-gray-600 mt-1">{module.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>📚 {module.lessons.length} lessons</span>
                        <span>🎯 {module.skills.length} skills</span>
                      </div>
                    </div>
                    <div className="text-2xl text-gray-300">→</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
