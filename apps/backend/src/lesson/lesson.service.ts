import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    const { storybookId, shapes, quizzes, ...rest } = createLessonDto;
    return this.prisma.lesson.create({
      data: {
        ...rest,
        shapes: shapes ?? [],
        quizzes: quizzes ?? [],
        storybook: {
          connect: { id: storybookId },
        },
      },
      include: {
        storybook: true,
      },
    });
  }

  async findAll() {
    return this.prisma.lesson.findMany({
      include: {
        storybook: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        storybook: true,
        progress: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: Partial<CreateLessonDto>) {
    const { storybookId, shapes, quizzes, ...rest } = updateLessonDto;
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...rest,
        ...(shapes !== undefined ? { shapes } : {}),
        ...(quizzes !== undefined ? { quizzes } : {}),
        ...(storybookId ? { storybook: { connect: { id: storybookId } } } : {}),
      },
      include: {
        storybook: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async remove(id: string) {
    const lesson = await this.prisma.lesson.delete({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async findByStorybook(storybookId: string) {
    return this.prisma.lesson.findMany({
      where: { storybookId },
      include: {
        storybook: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}
