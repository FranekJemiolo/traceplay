import { Module } from '@nestjs/common';
import { StorybookService } from './storybook.service';
import { StorybookController } from './storybook.controller';

@Module({
  controllers: [StorybookController],
  providers: [StorybookService],
  exports: [StorybookService],
})
export class StorybookModule {}
