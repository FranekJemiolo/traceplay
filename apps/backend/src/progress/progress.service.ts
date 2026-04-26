import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, lessonId: string) {
    return this.prisma.studentProgress.create({
      data: {
        userId,
        lessonId,
      },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    if (userId) {
      return this.prisma.studentProgress.findMany({
        where: { userId },
        include: {
          lesson: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    }
    return this.prisma.studentProgress.findMany({
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const progress = await this.prisma.studentProgress.findUnique({
      where: { id },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress;
  }

  async update(id: string, data: { completed?: boolean; score?: number }) {
    const progress = await this.prisma.studentProgress.update({
      where: { id },
      data: {
        ...(data.completed !== undefined && { completed: data.completed, completedAt: data.completed ? new Date() : null }),
        ...(data.score !== undefined && { score: data.score }),
      },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress;
  }

  async findByUserAndLesson(userId: string, lessonId: string) {
    return this.prisma.studentProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserStats(userId: string) {
    const progress = await this.prisma.studentProgress.findMany({
      where: { userId },
      include: {
        lesson: true,
      },
    });

    const total = progress.length;
    const completed = progress.filter((p) => p.completed).length;
    const averageScore = progress
      .filter((p) => p.score !== null)
      .reduce((sum, p) => sum + p.score, 0) / (progress.filter((p) => p.score !== null).length || 1);

    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageScore: averageScore || 0,
    };
  }
}
