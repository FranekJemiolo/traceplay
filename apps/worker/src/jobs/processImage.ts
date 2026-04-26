import { Job } from 'bullmq';
import { extractContours } from '@traceplay/vector';
import { annotateShape } from '@traceplay/annotation';
import { generateQuiz } from '@traceplay/quiz';

export const processImageJob = async (job: Job) => {
  const { imageData, options } = job.data;

  try {
    const shapes = await extractContours(imageData);

    const annotatedShapes = shapes.map((shape) =>
      annotateShape(
        shape,
        options?.label || 'unknown',
        options?.description || '',
        options?.instructions || ''
      )
    );

    const quizzes = annotatedShapes.map((shape) =>
      generateQuiz({
        context: shape.label,
        type: 'multiple_choice',
        optionsCount: 4,
      })
    );

    return {
      shapes: annotatedShapes,
      quizzes,
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
};
