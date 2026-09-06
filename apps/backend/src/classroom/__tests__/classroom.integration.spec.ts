import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassroomService } from '../classroom.service';
import { ClassroomGateway } from '../classroom.gateway';
import { UserRole } from '@prisma/client';

describe('Classroom & PostgreSQL Database Integration Tests', () => {
  let prisma: PrismaService;
  let classroomService: ClassroomService;
  let classroomGateway: ClassroomGateway;

  const testSessionCode = `TEST-${Date.now().toString().slice(-4)}`;
  let teacherId: string;
  let student1Id: string;
  let student2Id: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ClassroomService, ClassroomGateway],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    classroomService = module.get<ClassroomService>(ClassroomService);
    classroomGateway = module.get<ClassroomGateway>(ClassroomGateway);

    // Clean up any previous test records
    await prisma.$connect();

    // 1. Create a real teacher in PostgreSQL
    const teacher = await prisma.user.upsert({
      where: { email: `teacher-${testSessionCode}@example.com` },
      update: {},
      create: {
        email: `teacher-${testSessionCode}@example.com`,
        name: 'Prof. Anderson',
        role: UserRole.TEACHER,
      },
    });
    teacherId = teacher.id;

    // 2. Create real students in PostgreSQL
    const student1 = await prisma.user.upsert({
      where: { email: `student1-${testSessionCode}@example.com` },
      update: {},
      create: {
        email: `student1-${testSessionCode}@example.com`,
        name: 'Emma Watson',
        role: UserRole.STUDENT,
      },
    });
    student1Id = student1.id;

    const student2 = await prisma.user.upsert({
      where: { email: `student2-${testSessionCode}@example.com` },
      update: {},
      create: {
        email: `student2-${testSessionCode}@example.com`,
        name: 'Liam Miller',
        role: UserRole.STUDENT,
      },
    });
    student2Id = student2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      const session = await prisma.session.findUnique({
        where: { code: testSessionCode },
      });
      if (session) {
        await prisma.sessionAttendee.deleteMany({
          where: { sessionId: session.id },
        });
        await prisma.session.delete({
          where: { id: session.id },
        });
      }
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              `teacher-${testSessionCode}@example.com`,
              `student1-${testSessionCode}@example.com`,
              `student2-${testSessionCode}@example.com`,
            ],
          },
        },
      });
      await prisma.$disconnect();
    } catch (e) {
      // Ignore cleanup error
    }
  });

  describe('1. Real Session Creation in PostgreSQL', () => {
    it('should create a classroom session in the database with teacher relation', async () => {
      const session = await classroomService.createSession(teacherId, testSessionCode);

      expect(session).toBeDefined();
      expect(session.code).toBe(testSessionCode);
      expect(session.active).toBe(true);
      expect(session.teacher.id).toBe(teacherId);
      expect(session.teacher.name).toBe('Prof. Anderson');

      // Verify directly in PostgreSQL
      const dbRecord = await prisma.session.findUnique({
        where: { code: testSessionCode },
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.code).toBe(testSessionCode);
    });
  });

  describe('2. Real Student Enrollment & Joining in PostgreSQL', () => {
    it('should enroll real students into the database session without mocked values', async () => {
      // Student 1 joins
      const attendee1 = await classroomService.joinSession(testSessionCode, student1Id);
      expect(attendee1).toBeDefined();
      expect(attendee1.userId).toBe(student1Id);
      expect(attendee1.progress).toBe(0);
      expect(attendee1.active).toBe(true);

      // Student 2 joins
      const attendee2 = await classroomService.joinSession(testSessionCode, student2Id);
      expect(attendee2).toBeDefined();
      expect(attendee2.userId).toBe(student2Id);

      // Verify attendee records in PostgreSQL
      const dbAttendees = await prisma.sessionAttendee.findMany({
        where: { session: { code: testSessionCode } },
        include: { user: true },
      });

      expect(dbAttendees.length).toBe(2);
      const studentNames = dbAttendees.map((a) => a.user.name);
      expect(studentNames).toContain('Emma Watson');
      expect(studentNames).toContain('Liam Miller');
    });

    it('should fetch session and real students directly from database via getSession', async () => {
      const sessionData = await classroomService.getSession(testSessionCode);

      expect(sessionData.code).toBe(testSessionCode);
      expect(sessionData.teacher.name).toBe('Prof. Anderson');
      expect(sessionData.attendees.length).toBe(2);

      const emma = sessionData.attendees.find((a) => a.userId === student1Id);
      expect(emma).toBeDefined();
      expect(emma?.name).toBe('Emma Watson');
      expect(emma?.progress).toBe(0);

      const liam = sessionData.attendees.find((a) => a.userId === student2Id);
      expect(liam).toBeDefined();
      expect(liam?.name).toBe('Liam Miller');
    });
  });

  describe('3. Real-Time Student Progress Persistence in PostgreSQL', () => {
    it('should persist student tracing progress directly to PostgreSQL', async () => {
      // Update Emma Watson progress to 85%
      const updatedEmma = await classroomService.updateProgress(testSessionCode, student1Id, 85);
      expect(updatedEmma.progress).toBe(85);

      // Update Liam Miller progress to 60%
      const updatedLiam = await classroomService.updateProgress(testSessionCode, student2Id, 60);
      expect(updatedLiam.progress).toBe(60);

      // Verify directly by querying PostgreSQL database
      const dbAttendee = await prisma.sessionAttendee.findFirst({
        where: {
          session: { code: testSessionCode },
          userId: student1Id,
        },
      });

      expect(dbAttendee).not.toBeNull();
      expect(dbAttendee?.progress).toBe(85);

      // Verify via service call
      const session = await classroomService.getSession(testSessionCode);
      const student1Data = session.attendees.find((a) => a.userId === student1Id);
      expect(student1Data?.progress).toBe(85);
      const student2Data = session.attendees.find((a) => a.userId === student2Id);
      expect(student2Data?.progress).toBe(60);
    });
  });

  describe('4. Student Leave & Database Status Update', () => {
    it('should update active status in PostgreSQL when a student leaves the session', async () => {
      await classroomService.leaveSession(testSessionCode, student2Id);

      // Query active attendees from service
      const session = await classroomService.getSession(testSessionCode);
      const activeIds = session.attendees.map((a) => a.userId);

      expect(activeIds).toContain(student1Id);
      expect(activeIds).not.toContain(student2Id);

      // Verify raw database flag
      const rawAttendee = await prisma.sessionAttendee.findFirst({
        where: {
          session: { code: testSessionCode },
          userId: student2Id,
        },
      });
      expect(rawAttendee?.active).toBe(false);
    });
  });
});
