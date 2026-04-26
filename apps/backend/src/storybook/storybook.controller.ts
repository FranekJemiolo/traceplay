import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StorybookService } from './storybook.service';
import { CreateStorybookDto } from './dto/create-storybook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storybooks')
@UseGuards(JwtAuthGuard)
export class StorybookController {
  constructor(private storybookService: StorybookService) {}

  @Post()
  create(@Body() createStorybookDto: CreateStorybookDto, @Request() req) {
    return this.storybookService.create(createStorybookDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.storybookService.findAll();
  }

  @Get('my')
  findMy(@Request() req) {
    return this.storybookService.findByCreator(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storybookService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStorybookDto: Partial<CreateStorybookDto>) {
    return this.storybookService.update(id, updateStorybookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storybookService.remove(id);
  }
}
