import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildCurriculum } from '@traceplay/curriculum';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async generateCurriculum(lessonIds: string[]) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        id: { in: lessonIds },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const curriculumLessons = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      shapes: (Array.isArray(l.shapes) ? l.shapes : []) as any[],
      skills: ((l.metadata as any)?.skills as string[]) || [l.title],
    }));

    const curriculum = buildCurriculum(curriculumLessons);
    return curriculum;
  }

  async getModules() {
    return this.prisma.module.findMany({
      include: {
        lessons: true,
        skills: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async getModule(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: true,
        skills: true,
      },
    });
  }

  async getSkills() {
    return this.prisma.skill.findMany({
      include: {
        module: true,
      },
    });
  }

  async getSkill(id: string) {
    return this.prisma.skill.findUnique({
      where: { id },
      include: {
        module: true,
      },
    });
  }
}
