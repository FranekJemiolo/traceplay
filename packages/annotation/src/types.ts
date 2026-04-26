import { Shape } from '@traceplay/vector';

export interface AnnotatedShape extends Shape {
  label: string;
  description: string;
  instructions: string;
}
