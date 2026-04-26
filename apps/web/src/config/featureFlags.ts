export interface FeatureFlags {
  // Frontend-capable features (work without backend)
  imageProcessing: boolean; // OpenCV.js browser-based processing
  lessonPreview: boolean; // Static image display with OpenCV
  
  // Backend-only features (require full backend)
  interactiveTracing: boolean; // Phaser game server
  adaptiveQuizzes: boolean; // AI quiz generation
  classroomMode: boolean; // WebSocket sessions
  curriculumManagement: boolean; // Database-backed curriculum
  userProgress: boolean; // Database-backed progress tracking
}

export const defaultFeatureFlags: FeatureFlags = {
  imageProcessing: true,
  lessonPreview: true,
  interactiveTracing: false,
  adaptiveQuizzes: false,
  classroomMode: false,
  curriculumManagement: false,
  userProgress: false,
};

export const fullModeFeatureFlags: FeatureFlags = {
  imageProcessing: true,
  lessonPreview: true,
  interactiveTracing: true,
  adaptiveQuizzes: true,
  classroomMode: true,
  curriculumManagement: true,
  userProgress: true,
};

export const getFeatureFlags = (): FeatureFlags => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
      (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) {
    return defaultFeatureFlags;
  }
  
  // Check for custom feature flags from environment
  if (process.env.NEXT_PUBLIC_FEATURE_FLAGS) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS);
    } catch (e) {
      console.error('Invalid NEXT_PUBLIC_FEATURE_FLAGS format', e);
    }
  }
  
  return fullModeFeatureFlags;
};
