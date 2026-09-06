import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateQuiz } from '@traceplay/quiz';
import { QuizType } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async generate(shape: any) {
    const quiz = generateQuiz(shape);
    return quiz;
  }

  async create(data: { prompt: string; type: QuizType | string; options: any; correctAnswer: string; lessonId?: string }) {
    const quizType = (data.type as QuizType) || QuizType.MULTIPLE_CHOICE;
    return this.prisma.quiz.create({
      data: {
        ...data,
        type: quizType,
      },
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

  async update(id: string, data: Partial<{ prompt: string; type: QuizType | string; options: any; correctAnswer: string }>) {
    const updateData: any = { ...data };
    if (data.type) {
      updateData.type = data.type as QuizType;
    }
    return this.prisma.quiz.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
