import Phaser from 'phaser';

export class QuizEntity extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, quiz: any) {
    super(scene, x, y);

    const bg = scene.add.rectangle(0, 0, 240, 120, 0x000000, 0.8);
    const text = scene.add.text(-110, -40, quiz.prompt, {
      wordWrap: { width: 220 },
      color: '#fff',
      fontSize: '14px',
    });

    this.add([bg, text]);

    quiz.options?.forEach((opt: string, i: number) => {
      const btn = scene.add
        .text(-100, i * 20, opt, { color: '#0f0', fontSize: '12px' })
        .setInteractive();

      btn.on('pointerdown', () => {
        scene.events.emit('QUIZ_ANSWERED', {
          correct: opt === quiz.correctAnswer,
        });

        this.destroy();
      });

      this.add(btn);
    });

    scene.add.existing(this);
  }
}
