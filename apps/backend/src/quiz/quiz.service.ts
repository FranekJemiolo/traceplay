import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateQuiz } from '@traceplay/quiz';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async generate(shape: any) {
    const quiz = generateQuiz(shape);
    return quiz;
  }

  async create(data: { prompt: string; type: string; options: any; correctAnswer: string; lessonId?: string }) {
    return this.prisma.quiz.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.quiz.findMany();
  }

  async findOne(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
    });
  }

  async findByLesson(lessonId: string) {
    return this.prisma.quiz.findMany({
      where: { lessonId },
    });
  }

  async update(id: string, data: Partial<{ prompt: string; type: string; options: any; correctAnswer: string }>) {
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
