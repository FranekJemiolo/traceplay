'use client';

import { useState } from 'react';
import { X, Users, Hand, Send, CheckCircle, Radio } from 'lucide-react';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomModal({ isOpen, onClose }: ClassroomModalProps) {
  const [sessionCode, setSessionCode] = useState('TRACE-101');
  const [isJoined, setIsJoined] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [handRaised, setHandRaised] = useState(false);
  const [students, setStudents] = useState([
    { id: '1', name: 'Emma W.', progress: 85, active: true },
    { id: '2', name: 'Liam K.', progress: 60, active: true },
    { id: '3', name: 'Sophia M.', progress: 100, active: true },
    { id: '4', name: 'Noah B.', progress: 40, active: true },
  ]);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionCode.trim()) {
      setIsJoined(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live Classroom Session</h2>
              <p className="text-xs text-slate-500">Real-time collaborative tracing and teacher supervision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isJoined ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Classroom Room Code
                </label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. TRACE-101)"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-center tracking-wider text-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      role === 'STUDENT'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">🎓 Student Mode</div>
                    <div className="text-xs text-slate-500 mt-0.5">Participate and follow teacher instructions</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('TEACHER')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      role === 'TEACHER'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">👩‍🏫 Teacher Monitor</div>
                    <div className="text-xs text-slate-500 mt-0.5">Supervise all students and push lessons</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Join Classroom Room <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Room Header */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Live Session</span>
                  </div>
                  <h3 className="text-xl font-mono font-bold text-indigo-950 mt-0.5">{sessionCode}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-700 font-medium bg-indigo-200/50 px-2.5 py-1 rounded-full">
                    {role === 'TEACHER' ? 'Instructor View' : 'Student Joined'}
                  </span>
                </div>
              </div>

              {role === 'TEACHER' ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800">Connected Students ({students.length})</h4>
                    <span className="text-xs text-slate-500">Live stroke synchronization</span>
                  </div>
                  <div className="space-y-2.5">
                    {students.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{st.name}</div>
                            <div className="text-xs text-slate-500">Drawing Shape #2</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${st.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-9 text-right">{st.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={() => alert('Broadcasting next lesson step to all students!')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" /> Broadcast Next Lesson Step
                    </button>
                    <button
                      onClick={() => setIsJoined(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Connected to Teacher's Board!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                    Your canvas strokes are synchronized with the teacher in real-time. Follow prompts on screen.
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setHandRaised(!handRaised)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        handRaised
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      <Hand className="w-4 h-4" />
                      {handRaised ? 'Hand Raised ✋' : 'Raise Hand'}
                    </button>
                    <button
                      onClick={() => setIsJoined(false)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl"
                    >
                      Leave Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
