import Phaser from 'phaser';
import { RuntimeKernel } from '@traceplay/runtime';
import { QuizEntity } from '../entities/QuizEntity';

export class GameScene extends Phaser.Scene {
  private kernel: RuntimeKernel;
  private graphics!: Phaser.GameObjects.Graphics;
  private currentStroke: Phaser.Geom.Point[] = [];
  private shapes: any[] = [];
  private currentShapeIndex = 0;

  constructor() {
    super({ key: 'GameScene' });

    this.kernel = new RuntimeKernel({
      students: {},
      sessions: {},
    });

    this.kernel.on('QUIZ_ANSWERED', (payload) => {
      console.log('Quiz answered:', payload);
    });
  }

  create() {
    this.graphics = this.add.graphics();

    this.input.on('pointerdown', this.startStroke, this);
    this.input.on('pointermove', this.continueStroke, this);
    this.input.on('pointerup', this.endStroke, this);

    this.loadDemoShapes();
    this.drawShapes();
  }

  private loadDemoShapes() {
    this.shapes = [
      {
        points: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 400, y: 400 },
          { x: 200, y: 400 },
        ],
        label: 'square',
      },
      {
        points: [
          { x: 500, y: 200 },
          { x: 600, y: 300 },
          { x: 500, y: 400 },
          { x: 400, y: 300 },
        ],
        label: 'diamond',
      },
    ];
  }

  private drawShapes() {
    this.graphics.lineStyle(3, 0x4a90e2);

    this.shapes.forEach((shape, index) => {
      if (index === this.currentShapeIndex) {
        this.graphics.strokePoints(shape.points, true);
      } else {
        this.graphics.lineStyle(1, 0x2c3e50);
        this.graphics.strokePoints(shape.points, true);
        this.graphics.lineStyle(3, 0x4a90e2);
      }
    });
  }

  private startStroke(pointer: Phaser.Input.Pointer) {
    this.currentStroke = [new Phaser.Geom.Point(pointer.x, pointer.y)];
  }

  private continueStroke(pointer: Phaser.Input.Pointer) {
    if (this.currentStroke.length === 0) return;

    this.currentStroke.push(new Phaser.Geom.Point(pointer.x, pointer.y));

    this.graphics.lineStyle(3, 0xe74c3c);
    this.graphics.beginPath();
    this.currentStroke.forEach((point, i) => {
      if (i === 0) {
        this.graphics.moveTo(point.x, point.y);
      } else {
        this.graphics.lineTo(point.x, point.y);
      }
    });
    this.graphics.strokePath();
  }

  private endStroke() {
    if (this.currentStroke.length < 5) {
      this.currentStroke = [];
      this.graphics.clear();
      this.drawShapes();
      return;
    }

    const currentShape = this.shapes[this.currentShapeIndex];
    const isMatch = this.isStrokeMatchingShape(this.currentStroke, currentShape.points);

    if (isMatch) {
      this.kernel.emit('SHAPE_COMPLETED', { shapeIndex: this.currentShapeIndex });
      this.spawnQuiz(currentShape);
      this.currentShapeIndex++;
      this.currentStroke = [];
      this.graphics.clear();
      this.drawShapes();
    } else {
      this.currentStroke = [];
      this.graphics.clear();
      this.drawShapes();
    }
  }

  private isStrokeMatchingShape(stroke: Phaser.Geom.Point[], shapePoints: any[]): boolean {
    let hits = 0;

    for (const p of stroke) {
      for (const s of shapePoints) {
        const dx = p.x - s.x;
        const dy = p.y - s.y;

        if (dx * dx + dy * dy < 625) {
          hits++;
          break;
        }
      }
    }

    return hits / stroke.length > 0.6;
  }

  private spawnQuiz(shape: any) {
    const quiz = {
      id: `quiz_${Date.now()}`,
      type: 'multiple_choice',
      prompt: 'What did you just draw?',
      options: ['square', 'circle', 'triangle', 'star'],
      correctAnswer: shape.label,
    };

    const quizEntity = new QuizEntity(this, 400, 300, quiz);
    this.add.existing(quizEntity);
  }
}
