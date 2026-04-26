import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  validateImageFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExtension = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    return true;
  }

  getFilePath(filename: string): string {
    return `/uploads/${filename}`;
  }
}
