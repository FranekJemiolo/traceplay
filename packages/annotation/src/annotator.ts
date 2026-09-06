import { Shape } from '@traceplay/vector';
import { AnnotatedShape } from './types';

export function classifyShapeHeuristic(shape: Shape): { label: string; description: string; instructions: string } {
  const points = shape.points || [];
  const { width, height } = shape.bbox;
  const aspectRatio = width / (height || 1);

  if (points.length >= 3 && points.length <= 4) {
    return {
      label: 'triangle',
      description: 'A 3-sided polygon with sharp corners.',
      instructions: 'Start from the top peak and trace down each side carefully.',
    };
  }

  if (points.length >= 4 && points.length <= 6) {
    if (Math.abs(aspectRatio - 1) < 0.2) {
      return {
        label: 'square',
        description: 'A symmetrical 4-sided shape with equal sides.',
        instructions: 'Follow the 4 equal sides clockwise starting from top-left.',
      };
    }
    return {
      label: 'rectangle',
      description: 'A 4-sided shape with two pairs of parallel sides.',
      instructions: 'Trace the horizontal and vertical sides around the perimeter.',
    };
  }

  if (points.length > 7 && Math.abs(aspectRatio - 1) < 0.25) {
    return {
      label: 'circle',
      description: 'A smooth continuous curved round shape.',
      instructions: 'Trace smoothly in one continuous curved loop.',
    };
  }

  if (points.length > 7 && (aspectRatio > 1.3 || aspectRatio < 0.77)) {
    return {
      label: 'oval',
      description: 'An elongated rounded oval shape.',
      instructions: 'Trace the curved boundary keeping your stroke steady.',
    };
  }

  return {
    label: 'outline',
    description: 'An interactive artistic contour.',
    instructions: 'Follow the outline smoothly from start to finish.',
  };
}

export function annotateShape(
  shape: Shape,
  label: string,
  description: string,
  instructions: string
): AnnotatedShape {
  return {
    ...shape,
    label,
    description,
    instructions,
  };
}

export function autoAnnotateShape(
  shape: Shape,
  overrideLabel?: string,
  overrideDescription?: string,
  overrideInstructions?: string
): AnnotatedShape {
  const classification = classifyShapeHeuristic(shape);
  return {
    ...shape,
    label: overrideLabel || classification.label,
    description: overrideDescription || classification.description,
    instructions: overrideInstructions || classification.instructions,
  };
}
