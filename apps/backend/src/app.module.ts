import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StorybookModule } from './storybook/storybook.module';
import { LessonModule } from './lesson/lesson.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { QuizModule } from './quiz/quiz.module';
import { RuntimeModule } from './runtime/runtime.module';
import { UploadModule } from './upload/upload.module';
import { ClassroomGateway } from './classroom/classroom.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    StorybookModule,
    LessonModule,
    CurriculumModule,
    QuizModule,
    RuntimeModule,
    UploadModule,
  ],
  providers: [ClassroomGateway],
})
export class AppModule {}
