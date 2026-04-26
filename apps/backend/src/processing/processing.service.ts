import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

export interface ProcessImageJob {
  imageUrl: string;
  lessonId: string;
}

@Injectable()
export class ProcessingService {
  constructor(@InjectQueue('image-processing') private imageQueue: Queue) {}

  async processImage(imageUrl: string, lessonId: string) {
    await this.imageQueue.add('process-image', {
      imageUrl,
      lessonId,
    });
  }

  // Note: Actual image processing happens in the worker app
  // which uses OpenCV.js for contour extraction
}
