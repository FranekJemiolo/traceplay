export type EventHandler = (payload: any) => void;

export interface StudentProgress {
  progress: number;
  score: number;
  skills: Record<string, number>;
}

export interface SessionState {
  lessonId: string;
  activeQuiz?: any;
}

export interface RuntimeState {
  students: Record<string, StudentProgress>;
  sessions: Record<string, SessionState>;
}
