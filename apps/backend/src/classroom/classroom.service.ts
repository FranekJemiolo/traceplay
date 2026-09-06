import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ClassroomSessionResponse {
  id: string;
  code: string;
  active: boolean;
  teacher: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  attendees: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    progress: number;
    active: boolean;
    joinedAt: Date;
  }>;
  createdAt: Date;
}

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) {}

  async createSession(teacherId: string, customCode?: string): Promise<any> {
    const code = customCode
      ? customCode.toUpperCase()
      : `TRACE-${Math.floor(100 + Math.random() * 900)}`;

    const existing = await this.prisma.session.findUnique({
      where: { code },
    });

    if (existing) {
      if (existing.active) {
        return this.getSession(code);
      }
      return this.prisma.session.update({
        where: { code },
        data: { active: true, teacherId },
        include: {
          teacher: { select: { id: true, name: true, email: true, role: true } },
          attendees: { include: { user: true } },
        },
      });
    }

    return this.prisma.session.create({
      data: {
        code,
        teacherId,
        active: true,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true, role: true } },
        attendees: { include: { user: true } },
      },
    });
  }

  async getSession(code: string): Promise<ClassroomSessionResponse> {
    const session = await this.prisma.session.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        attendees: {
          where: { active: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Classroom session '${code}' not found`);
    }

    return {
      id: session.id,
      code: session.code,
      active: session.active,
      teacher: session.teacher,
      attendees: session.attendees.map((att) => ({
        id: att.id,
        userId: att.userId,
        name: att.user?.name || att.user?.email.split('@')[0] || 'Student',
        email: att.user?.email || '',
        avatarUrl: att.user?.avatarUrl || null,
        progress: att.progress,
        active: att.active,
        joinedAt: att.joinedAt,
      })),
      createdAt: session.createdAt,
    };
  }

  async joinSession(code: string, userId: string): Promise<any> {
    const session = await this.prisma.session.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session || !session.active) {
      throw new BadRequestException(`Session '${code}' is inactive or does not exist`);
    }

    // Upsert attendee
    const attendee = await this.prisma.sessionAttendee.upsert({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId,
        },
      },
      update: {
        active: true,
      },
      create: {
        sessionId: session.id,
        userId,
        progress: 0,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return attendee;
  }

  async updateProgress(code: string, userId: string, progress: number): Promise<any> {
    const session = await this.prisma.session.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      throw new NotFoundException(`Session '${code}' not found`);
    }

    return this.prisma.sessionAttendee.update({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId,
        },
      },
      data: {
        progress,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async leaveSession(code: string, userId: string): Promise<any> {
    const session = await this.prisma.session.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session) return null;

    try {
      return await this.prisma.sessionAttendee.update({
        where: {
          sessionId_userId: {
            sessionId: session.id,
            userId,
          },
        },
        data: {
          active: false,
        },
      });
    } catch {
      return null;
    }
  }

  async listActiveSessions(): Promise<any[]> {
    return this.prisma.session.findMany({
      where: { active: true },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { attendees: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
