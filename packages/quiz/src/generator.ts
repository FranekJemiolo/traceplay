import { Quiz } from './types';

const COMMON_OBJECTS = [
  'circle',
  'square',
  'triangle',
  'rectangle',
  'oval',
  'star',
  'heart',
  'diamond',
  'turtle',
  'fish',
  'bird',
  'butterfly',
  'tree',
  'flower',
  'house',
  'car',
];

const CORNER_MAP: Record<string, number> = {
  circle: 0,
  oval: 0,
  triangle: 3,
  square: 4,
  rectangle: 4,
  diamond: 4,
  star: 5,
};

export function generateQuiz(
  shape: any,
  kind?: 'identification' | 'corners' | 'phonics'
): Quiz {
  const label = (shape?.label || shape?.context || 'shape').toLowerCase();

  // If corners mode requested and known
  if (kind === 'corners' || (CORNER_MAP[label] !== undefined && Math.random() < 0.35)) {
    const corners = CORNER_MAP[label] ?? (shape.points ? Math.min(shape.points.length, 8) : 4);
    const options = shuffle([
      corners.toString(),
      Math.max(0, corners - 1).toString(),
      (corners + 1).toString(),
      (corners + 2).toString(),
    ]);

    return {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'multiple_choice',
      prompt: `How many corners does this ${label} have?`,
      options,
      correctAnswer: corners.toString(),
    };
  }

  // Phonics mode (for young learners tracing letters or named objects)
  if (kind === 'phonics' || Math.random() < 0.25) {
    const firstLetter = label.charAt(0).toUpperCase();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== firstLetter);
    const distractorLetters = shuffle(alphabet).slice(0, 3);
    const options = shuffle([firstLetter, ...distractorLetters]);

    return {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'multiple_choice',
      prompt: `What letter does "${label}" begin with?`,
      options,
      correctAnswer: firstLetter,
    };
  }

  // Default: Identification mode
  const distractors = COMMON_OBJECTS
    .filter(x => x !== label)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = shuffle([label, ...distractors]);

  return {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'multiple_choice',
    prompt: `What did you just trace?`,
    options,
    correctAnswer: label,
  };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
