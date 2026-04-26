import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StorybookModule } from './storybook/storybook.module';
import { LessonModule } from './lesson/lesson.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { QuizModule } from './quiz/quiz.module';
import { RuntimeModule } from './runtime/runtime.module';
import { ClassroomGateway } from './classroom/classroom.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    StorybookModule,
    LessonModule,
    CurriculumModule,
    QuizModule,
    RuntimeModule,
  ],
  providers: [ClassroomGateway],
})
export class AppModule {}
