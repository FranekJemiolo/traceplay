import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: createLessonDto,
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
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
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
