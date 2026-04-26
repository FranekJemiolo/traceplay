import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, name?: string, role: UserRole = UserRole.STUDENT) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, data: { name?: string; role?: UserRole }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role as any }),
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
