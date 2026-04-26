import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStorybookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
