'use client';

import { useState } from 'react';
import { demoCurriculum, DemoModule, DemoLesson, demoProgress } from '../lib/demoData';
import { BookOpen, CheckCircle, Clock, Award, ArrowLeft, Play, X, Star, Sparkles } from 'lucide-react';

export default function CurriculumView({
  onClose,
  onStartLesson,
  activeLessonId,
}: {
  onClose: () => void;
  onStartLesson?: (lesson: DemoLesson) => void;
  activeLessonId?: string;
}) {
  const [selectedModule, setSelectedModule] = useState<DemoModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<DemoLesson | null>(() => {
    if (activeLessonId) {
      for (const m of demoCurriculum.modules) {
        const found = m.lessons.find((l) => l.id === activeLessonId);
        if (found) return found;
      }
    }
    return null;
  });

  const getAssetUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const prefix = typeof window !== 'undefined' && window.location.pathname.startsWith('/traceplay') ? '/traceplay' : '';
    return `${prefix}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isLessonCompleted = (id: string) => demoProgress.completedLessons.includes(id);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">{demoCurriculum.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{demoCurriculum.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Progress Overview Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-md shadow-indigo-600/10">
            <div className="text-center border-r border-white/20 pr-2">
              <div className="text-2xl font-black">{demoCurriculum.modules.length}</div>
              <div className="text-xs font-semibold text-indigo-200">Modules</div>
            </div>
            <div className="text-center border-r border-white/20 pr-2">
              <div className="text-2xl font-black">{demoCurriculum.totalLessons}</div>
              <div className="text-xs font-semibold text-indigo-200">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">{demoProgress.completedLessons.length} / {demoCurriculum.totalLessons}</div>
              <div className="text-xs font-semibold text-indigo-200">Mastered</div>
            </div>
          </div>

          {selectedLesson ? (
            /* Lesson Detail View */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Lesson List
              </button>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-slate-900">{selectedLesson.title}</h3>
                      {isLessonCompleted(selectedLesson.id) && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          selectedLesson.difficulty === 'beginner'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedLesson.difficulty === 'intermediate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedLesson.difficulty.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{selectedLesson.estimatedTime} min practice
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">{selectedLesson.description}</p>

                {/* Skills tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills Target</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.skills?.map((sk) => (
                      <span
                        key={sk}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-200/60 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-violet-500" /> {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Lesson Reference Artwork
                  </div>
                  <div className="h-56 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={getAssetUrl(selectedLesson.imageUrl)}
                      alt={selectedLesson.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Action */}
                <button
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  onClick={() => {
                    if (onStartLesson && selectedLesson) {
                      onStartLesson(selectedLesson);
                    }
                  }}
                >
                  <Play className="w-4 h-4 fill-white" /> Start Interactive Tracing Lesson
                </button>
              </div>
            </div>
          ) : selectedModule ? (
            /* Module Lessons View */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Modules
              </button>

              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedModule.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedModule.description}</p>
              </div>

              <div className="space-y-3">
                {selectedModule.lessons.map((lesson) => {
                  const completed = isLessonCompleted(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 flex-shrink-0">
                          <img
                            src={getAssetUrl(lesson.imageUrl)}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {lesson.title}
                            </h4>
                            {completed && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {lesson.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-400">⏱ {lesson.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        Select →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Modules List */
            <div className="space-y-4 animate-in fade-in duration-200">
              {demoCurriculum.modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all flex items-start justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {module.title}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full">
                        {module.lessons.length} Lessons
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{module.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {module.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all pl-4 text-xl">
                    →
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
