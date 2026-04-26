import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('curriculum')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Post('generate')
  generate(@Body() body: { lessonIds: string[] }) {
    return this.curriculumService.generateCurriculum(body.lessonIds);
  }

  @Get('modules')
  getModules() {
    return this.curriculumService.getModules();
  }

  @Get('modules/:id')
  getModule(@Param('id') id: string) {
    return this.curriculumService.getModule(id);
  }

  @Get('skills')
  getSkills() {
    return this.curriculumService.getSkills();
  }

  @Get('skills/:id')
  getSkill(@Param('id') id: string) {
    return this.curriculumService.getSkill(id);
  }
}
