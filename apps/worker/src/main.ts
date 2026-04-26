import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processImageJob } from './jobs/processImage';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const worker = new Worker('image-processing', processImageJob, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log('Worker started');
