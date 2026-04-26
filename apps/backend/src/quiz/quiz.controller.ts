import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('generate')
  generate(@Body() body: { shape: any }) {
    return this.quizService.generate(body.shape);
  }

  @Post()
  create(@Body() data: { prompt: string; type: string; options: any; correctAnswer: string; lessonId?: string }) {
    return this.quizService.create(data);
  }

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.quizService.findByLesson(lessonId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<{ prompt: string; type: string; options: any; correctAnswer: string }>) {
    return this.quizService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
