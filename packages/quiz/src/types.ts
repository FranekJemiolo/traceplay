export type QuizType = 'multiple_choice' | 'fill_blank' | 'image_select';

export interface Quiz {
  id: string;
  type: QuizType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
}
