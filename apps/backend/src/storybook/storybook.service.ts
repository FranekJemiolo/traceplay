import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStorybookDto } from './dto/create-storybook.dto';

@Injectable()
export class StorybookService {
  constructor(private prisma: PrismaService) {}

  async create(createStorybookDto: CreateStorybookDto, createdBy: string) {
    return this.prisma.storybook.create({
      data: {
        ...createStorybookDto,
        createdBy,
      },
      include: {
        lessons: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.storybook.findMany({
      include: {
        lessons: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const storybook = await this.prisma.storybook.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!storybook) {
      throw new NotFoundException('Storybook not found');
    }

    return storybook;
  }

  async update(id: string, updateStorybookDto: Partial<CreateStorybookDto>) {
    const storybook = await this.prisma.storybook.update({
      where: { id },
      data: updateStorybookDto,
      include: {
        lessons: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!storybook) {
      throw new NotFoundException('Storybook not found');
    }

    return storybook;
  }

  async remove(id: string) {
    const storybook = await this.prisma.storybook.delete({
      where: { id },
    });

    if (!storybook) {
      throw new NotFoundException('Storybook not found');
    }

    return storybook;
  }

  async findByCreator(createdBy: string) {
    return this.prisma.storybook.findMany({
      where: { createdBy },
      include: {
        lessons: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
