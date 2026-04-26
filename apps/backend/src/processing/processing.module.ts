import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ProcessingService } from './processing.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image-processing',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
