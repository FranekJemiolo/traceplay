import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post()
  create(@Body() body: { lessonId: string }, @Request() req) {
    return this.progressService.create(req.user.id, body.lessonId);
  }

  @Get()
  findAll(@Request() req) {
    return this.progressService.findAll(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.progressService.getUserStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressService.findOne(id);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string, @Request() req) {
    return this.progressService.findByUserAndLesson(req.user.id, lessonId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { completed?: boolean; score?: number }) {
    return this.progressService.update(id, data);
  }
}
