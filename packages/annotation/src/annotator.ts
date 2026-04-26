import { Shape } from '@traceplay/vector';
import { AnnotatedShape } from './types';

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
