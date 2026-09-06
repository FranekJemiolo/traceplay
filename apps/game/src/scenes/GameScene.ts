import Phaser from 'phaser';

class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playStroke() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 60, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {}
  }
}

export class GameScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private guideGraphics!: Phaser.GameObjects.Graphics;
  private currentStroke: Phaser.Geom.Point[] = [];
  private shapes: any[] = [];
  private currentShapeIndex = 0;
  private sfx = new SoundFX();
  private statusText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private totalScore = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.guideGraphics = this.add.graphics();
    this.graphics = this.add.graphics();

    this.statusText = this.add.text(20, 20, 'Trace the shape on screen', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    });

    this.scoreText = this.add.text(680, 20, 'Score: 0', {
      fontSize: '20px',
      color: '#68d391',
      fontFamily: 'sans-serif',
      align: 'right',
    });

    this.input.on('pointerdown', this.startStroke, this);
    this.input.on('pointermove', this.continueStroke, this);
    this.input.on('pointerup', this.endStroke, this);

    // Setup cross-window postMessage bridge
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'LOAD_LESSON') {
          this.loadLessonPayload(event.data.payload);
        }
      });

      // Notify parent that game is ready
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'GAME_READY' }, '*');
      }
    }

    this.loadDemoShapes();
    this.drawShapes();
  }

  public loadLessonPayload(payload: any) {
    if (payload?.shapes && Array.isArray(payload.shapes) && payload.shapes.length > 0) {
      this.shapes = payload.shapes;
      this.currentShapeIndex = 0;
      this.totalScore = 0;
      this.scoreText.setText(`Score: 0`);
      this.statusText.setText(`Tracing: ${payload.title || 'Lesson'}`);
      this.drawShapes();
    }
  }

  private loadDemoShapes() {
    this.shapes = [
      {
        points: [
          { x: 250, y: 150 },
          { x: 550, y: 150 },
          { x: 550, y: 450 },
          { x: 250, y: 450 },
        ],
        label: 'Square',
      },
      {
        points: [
          { x: 400, y: 120 },
          { x: 580, y: 450 },
          { x: 220, y: 450 },
        ],
        label: 'Triangle',
      },
      {
        points: [
          { x: 400, y: 150 },
          { x: 550, y: 300 },
          { x: 400, y: 450 },
          { x: 250, y: 300 },
        ],
        label: 'Diamond',
      },
    ];
  }

  private drawShapes() {
    this.guideGraphics.clear();

    if (this.currentShapeIndex >= this.shapes.length) {
      this.statusText.setText('🎉 Lesson Completed! Great job!');
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'LESSON_COMPLETED',
          payload: { totalScore: this.totalScore },
        }, '*');
      }
      return;
    }

    const currentShape = this.shapes[this.currentShapeIndex];
    this.statusText.setText(`Trace: ${currentShape.label || 'Shape'} (${this.currentShapeIndex + 1}/${this.shapes.length})`);

    // Draw guide background outline
    this.guideGraphics.lineStyle(6, 0x334155, 0.8);
    this.guideGraphics.strokePoints(currentShape.points, true);

    // Draw numbered dots along the guide path
    currentShape.points.forEach((pt: any) => {
      this.guideGraphics.fillStyle(0x6366f1, 1);
      this.guideGraphics.fillCircle(pt.x, pt.y, 8);
      this.guideGraphics.fillStyle(0xffffff, 1);
      this.guideGraphics.fillCircle(pt.x, pt.y, 4);
    });
  }

  private startStroke(pointer: Phaser.Input.Pointer) {
    this.currentStroke = [new Phaser.Geom.Point(pointer.x, pointer.y)];
    this.sfx.playStroke();
  }

  private continueStroke(pointer: Phaser.Input.Pointer) {
    if (this.currentStroke.length === 0) return;

    this.currentStroke.push(new Phaser.Geom.Point(pointer.x, pointer.y));

    if (this.currentStroke.length % 5 === 0) {
      this.sfx.playStroke();
    }

    // Glowing active stroke
    this.graphics.clear();
    this.graphics.lineStyle(8, 0x38bdf8, 0.9);
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
      return;
    }

    if (this.currentShapeIndex >= this.shapes.length) return;

    const currentShape = this.shapes[this.currentShapeIndex];
    const matchAccuracy = this.calculateAccuracy(this.currentStroke, currentShape.points);

    if (matchAccuracy >= 0.55) {
      const awardedScore = Math.round(matchAccuracy * 100);
      this.totalScore += awardedScore;
      this.scoreText.setText(`Score: ${this.totalScore}`);
      this.sfx.playSuccess();

      this.spawnCelebration();

      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SHAPE_COMPLETED',
          payload: {
            shapeIndex: this.currentShapeIndex,
            accuracy: matchAccuracy,
            score: awardedScore,
          },
        }, '*');
      }

      this.currentShapeIndex++;
      this.currentStroke = [];
      this.graphics.clear();
      this.drawShapes();
    } else {
      this.statusText.setText('Try again! Follow the guide dots closely.');
      this.currentStroke = [];
      this.graphics.clear();
    }
  }

  private calculateAccuracy(stroke: Phaser.Geom.Point[], shapePoints: any[]): number {
    let hits = 0;
    const thresholdSq = 1600; // 40px radius tolerance

    for (const p of stroke) {
      for (const s of shapePoints) {
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        if (dx * dx + dy * dy < thresholdSq) {
          hits++;
          break;
        }
      }
    }

    return hits / stroke.length;
  }

  private spawnCelebration() {
    const emitter = this.add.particles(400, 300, '__WHITE', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 600,
      gravityY: 150,
      quantity: 20,
    });

    this.time.delayedCall(700, () => {
      emitter.destroy();
    });
  }
}
