import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClassroomService, ClassroomSessionResponse } from './classroom.service';

@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get('sessions')
  async listSessions(): Promise<any[]> {
    return this.classroomService.listActiveSessions();
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body() body: { teacherId: string; code?: string },
  ): Promise<any> {
    return this.classroomService.createSession(body.teacherId, body.code);
  }

  @Get('sessions/:code')
  async getSession(@Param('code') code: string): Promise<ClassroomSessionResponse> {
    return this.classroomService.getSession(code);
  }

  @Post('sessions/:code/join')
  @HttpCode(HttpStatus.OK)
  async joinSession(
    @Param('code') code: string,
    @Body() body: { userId: string },
  ): Promise<any> {
    return this.classroomService.joinSession(code, body.userId);
  }

  @Post('sessions/:code/progress')
  @HttpCode(HttpStatus.OK)
  async updateProgress(
    @Param('code') code: string,
    @Body() body: { userId: string; progress: number },
  ): Promise<any> {
    return this.classroomService.updateProgress(code, body.userId, body.progress);
  }

  @Post('sessions/:code/leave')
  @HttpCode(HttpStatus.OK)
  async leaveSession(
    @Param('code') code: string,
    @Body() body: { userId: string },
  ): Promise<any> {
    return this.classroomService.leaveSession(code, body.userId);
  }
}
