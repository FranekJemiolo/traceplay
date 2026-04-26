import { IsNotEmpty, IsString, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  storybookId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  order: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  shapes?: any;

  @IsObject()
  @IsOptional()
  quizzes?: any;
}
