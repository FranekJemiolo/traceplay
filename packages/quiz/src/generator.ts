import { Quiz } from './types';

const COMMON_OBJECTS = [
  'cat',
  'dog',
  'car',
  'tree',
  'house',
  'fish',
  'bird',
  'star',
  'heart',
  'circle',
  'square',
  'triangle',
];

export function generateQuiz(shape: any): Quiz {
  const correct = shape.label || 'object';

  const distractors = COMMON_OBJECTS
    .filter(x => x !== correct)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = shuffle([correct, ...distractors]);

  return {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'multiple_choice',
    prompt: 'What did you just draw?',
    options,
    correctAnswer: correct,
  };
}

function shuffle(arr: string[]): string[] {
  return arr.sort(() => Math.random() - 0.5);
}
