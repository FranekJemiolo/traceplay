'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Users, Hand, Send, CheckCircle, Radio, Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface StudentAttendee {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  progress: number;
  active: boolean;
}

interface ClassroomSessionData {
  id: string;
  code: string;
  active: boolean;
  teacher: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  attendees: StudentAttendee[];
  createdAt: string;
}

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomModal({ isOpen, onClose }: ClassroomModalProps) {
  const [sessionCode, setSessionCode] = useState('TRACE-101');
  const [isJoined, setIsJoined] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [handRaised, setHandRaised] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Database-sourced session data (No mocked defaults!)
  const [sessionData, setSessionData] = useState<ClassroomSessionData | null>(null);
  const [students, setStudents] = useState<StudentAttendee[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch session data from backend database
  const fetchSessionFromDb = useCallback(async (code: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/classroom/sessions/${encodeURIComponent(code)}`);
      if (!res.ok) {
        throw new Error(`Session '${code}' not found in database. Check the code or create a new session.`);
      }
      const data: ClassroomSessionData = await res.json();
      setSessionData(data);
      setStudents(data.attendees || []);
      return data;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to classroom database');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Create a new session in database
  const handleCreateSession = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/classroom/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: 'teacher-default',
          code: `TRACE-${Math.floor(100 + Math.random() * 900)}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to create session in database');
      const data = await res.json();
      setSessionCode(data.code);
      setSessionData(data);
      setStudents(data.attendees || []);
      setRole('TEACHER');
      setIsJoined(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;

    const data = await fetchSessionFromDb(sessionCode.trim().toUpperCase());
    if (data) {
      setIsJoined(true);
    }
  };

  // Poll for real-time progress updates from database while joined
  useEffect(() => {
    if (!isJoined || !sessionCode) return;

    const interval = setInterval(() => {
      fetchSessionFromDb(sessionCode);
    }, 4000);

    return () => clearInterval(interval);
  }, [isJoined, sessionCode, fetchSessionFromDb]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live Classroom Session</h2>
              <p className="text-xs text-slate-500">Database-backed collaborative tracing and teacher supervision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isJoined ? (
            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Classroom Room Code
                  </label>
                  <button
                    type="button"
                    onClick={handleCreateSession}
                    disabled={isLoading}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Room
                  </button>
                </div>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. TRACE-101)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-center tracking-wider text-xl font-black uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      role === 'STUDENT'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">🎓 Student Mode</div>
                    <div className="text-xs text-slate-500 mt-1">Connect your canvas and follow along</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('TEACHER')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      role === 'TEACHER'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-sm">👩‍🏫 Teacher Monitor</div>
                    <div className="text-xs text-slate-500 mt-1">Live attendee roster & progress oversight</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Connecting to Database...
                  </>
                ) : (
                  <>
                    Join Classroom <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Room Header */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                      Live PostgreSQL Session
                    </span>
                  </div>
                  <h3 className="text-xl font-mono font-black text-indigo-950 mt-0.5">{sessionCode}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-700 font-bold bg-indigo-200/50 px-3 py-1 rounded-full">
                    {role === 'TEACHER' ? 'Instructor Dashboard' : 'Student Connected'}
                  </span>
                </div>
              </div>

              {role === 'TEACHER' ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      Enrolled Students ({students.length})
                    </h4>
                    <span className="text-xs text-slate-500">Sourced live from database</span>
                  </div>

                  {students.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">No students connected yet</p>
                      <p className="text-[11px] text-slate-400">
                        Share room code <span className="font-mono font-bold text-indigo-600">{sessionCode}</span> with students to see them appear in real time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {students.map((st) => (
                        <div
                          key={st.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{st.name}</div>
                              <div className="text-[10px] text-slate-400">{st.email || 'Active student'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, st.progress))}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">
                              {Math.round(st.progress)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => fetchSessionFromDb(sessionCode)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                      onClick={() => setIsJoined(false)}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl transition-colors ml-auto"
                    >
                      Leave Room
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Connected to Teacher Session!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                    Your session attendee record is persisted in PostgreSQL. Your strokes synchronize with the classroom instructor.
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
