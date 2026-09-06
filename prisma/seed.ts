import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TracePlay PostgreSQL Database...');

  // 1. Create Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@traceplay.com' },
    update: {},
    create: {
      email: 'teacher@traceplay.com',
      name: 'Prof. Sarah Connor',
      role: UserRole.TEACHER,
    },
  });
  console.log(`✓ Teacher created: ${teacher.name} (${teacher.email})`);

  // 2. Create Students
  const studentsData = [
    { email: 'emma@traceplay.com', name: 'Emma Watson', role: UserRole.STUDENT },
    { email: 'liam@traceplay.com', name: 'Liam Miller', role: UserRole.STUDENT },
    { email: 'sophia@traceplay.com', name: 'Sophia Chen', role: UserRole.STUDENT },
    { email: 'noah@traceplay.com', name: 'Noah Brown', role: UserRole.STUDENT },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: s,
    });
    students.push(student);
  }
  console.log(`✓ Enrolled ${students.length} students in database`);

  // 3. Create Default Live Classroom Session: TRACE-101
  const session = await prisma.session.upsert({
    where: { code: 'TRACE-101' },
    update: { active: true, teacherId: teacher.id },
    create: {
      code: 'TRACE-101',
      teacherId: teacher.id,
      active: true,
    },
  });
  console.log(`✓ Live Classroom Session active: ${session.code}`);

  // 4. Enroll Students as Attendees with Progress
  const sampleProgress = [85, 60, 100, 40];
  for (let i = 0; i < students.length; i++) {
    await prisma.sessionAttendee.upsert({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: students[i].id,
        },
      },
      update: {
        progress: sampleProgress[i],
        active: true,
      },
      create: {
        sessionId: session.id,
        userId: students[i].id,
        progress: sampleProgress[i],
        active: true,
      },
    });
  }
  console.log(`✓ Registered ${students.length} attendees for session ${session.code}`);

  // 5. Create Sample Storybook
  const storybook = await prisma.storybook.upsert({
    where: { id: 'storybook-cat-adventures' },
    update: {},
    create: {
      id: 'storybook-cat-adventures',
      title: 'Feline Friends Tracing Adventure',
      description: 'Master curves and fine motor precision tracing lovable kittens.',
      imageUrl: '/cat_sample.png',
      createdBy: teacher.id,
    },
  });

  // 6. Create Lessons
  await prisma.lesson.upsert({
    where: { id: 'lesson-1' },
    update: {},
    create: {
      id: 'lesson-1',
      storybookId: storybook.id,
      title: 'Cute Cat Silhouette',
      order: 1,
      difficulty: 'beginner',
      imageUrl: '/cat_sample.png',
      shapes: [
        { label: 'Cat Head & Ears', points: [] },
      ],
      quizzes: [],
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'lesson-2' },
    update: {},
    create: {
      id: 'lesson-2',
      storybookId: storybook.id,
      title: 'Playful Kitten & Yarn',
      order: 2,
      difficulty: 'intermediate',
      imageUrl: '/cat_playful.png',
      shapes: [
        { label: 'Playful Kitten & Yarn', points: [] },
      ],
      quizzes: [],
    },
  });

  console.log('✨ Seeding complete! Database is primed and ready.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
