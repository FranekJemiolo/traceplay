// Mock data provider for demo mode
// This provides sample data without requiring backend API calls

export interface DemoLesson {
  id: string;
  title: string;
  order: number;
  imageUrl: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
}

export interface DemoStorybook {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lessons: DemoLesson[];
  createdAt: string;
}

export interface DemoModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: DemoLesson[];
  skills: string[];
}

export interface DemoCurriculum {
  id: string;
  title: string;
  description: string;
  modules: DemoModule[];
  totalLessons: number;
  totalSkills: number;
}

export const demoStorybooks: DemoStorybook[] = [
  {
    id: 'storybook-1',
    title: 'Basic Shapes Adventure',
    description: 'Learn fundamental shapes through fun tracing exercises',
    imageUrl: '/generated_turtle.png',
    createdAt: '2024-01-15',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Circles and Ovals',
        order: 1,
        imageUrl: '/generated_turtle.png',
        description: 'Master the art of drawing perfect circles and smooth ovals',
        difficulty: 'beginner',
        estimatedTime: 15,
      },
      {
        id: 'lesson-2',
        title: 'Squares and Rectangles',
        order: 2,
        imageUrl: '/generated_turtle.png',
        description: 'Practice drawing straight lines and right angles',
        difficulty: 'beginner',
        estimatedTime: 20,
      },
      {
        id: 'lesson-3',
        title: 'Triangles',
        order: 3,
        imageUrl: '/generated_turtle.png',
        description: 'Learn to draw different types of triangles',
        difficulty: 'beginner',
        estimatedTime: 15,
      },
    ],
  },
  {
    id: 'storybook-2',
    title: 'Animal Kingdom',
    description: 'Trace and learn about animals through their outlines',
    imageUrl: '/generated_turtle.png',
    createdAt: '2024-02-01',
    lessons: [
      {
        id: 'lesson-4',
        title: 'Turtle Shell Patterns',
        order: 1,
        imageUrl: '/generated_turtle.png',
        description: 'Explore the geometric patterns on turtle shells',
        difficulty: 'intermediate',
        estimatedTime: 25,
      },
      {
        id: 'lesson-5',
        title: 'Bird Silhouettes',
        order: 2,
        imageUrl: '/generated_turtle.png',
        description: 'Trace the elegant outlines of flying birds',
        difficulty: 'intermediate',
        estimatedTime: 30,
      },
    ],
  },
];

export const demoCurriculum: DemoCurriculum = {
  id: 'curriculum-1',
  title: 'Foundational Tracing Course',
  description: 'A comprehensive curriculum for learning shape recognition and tracing skills',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Basic Shapes',
      description: 'Introduction to fundamental geometric shapes',
      order: 1,
      lessons: demoStorybooks[0].lessons,
      skills: ['Shape Recognition', 'Hand-Eye Coordination', 'Fine Motor Skills'],
    },
    {
      id: 'module-2',
      title: 'Module 2: Nature Patterns',
      description: 'Learning from natural shapes and patterns',
      order: 2,
      lessons: demoStorybooks[1].lessons,
      skills: ['Pattern Recognition', 'Observation Skills', 'Artistic Expression'],
    },
    {
      id: 'module-3',
      title: 'Module 3: Advanced Techniques',
      description: 'Complex shapes and artistic tracing',
      order: 3,
      lessons: [
        {
          id: 'lesson-6',
          title: 'Complex Geometric Patterns',
          order: 1,
          imageUrl: '/generated_turtle.png',
          description: 'Combine multiple shapes into complex patterns',
          difficulty: 'advanced',
          estimatedTime: 45,
        },
      ],
      skills: ['Complex Pattern Analysis', 'Precision Tracing', 'Creative Design'],
    },
  ],
  totalLessons: 6,
  totalSkills: 9,
};

export const demoProgress = {
  completedLessons: ['lesson-1'],
  inProgressLessons: ['lesson-2'],
  totalLessons: 6,
  completionRate: 16.67,
  averageScore: 85,
};

// Helper functions for demo mode
export const getDemoStorybookById = (id: string): DemoStorybook | undefined => {
  return demoStorybooks.find(sb => sb.id === id);
};

export const getDemoLessonById = (id: string): DemoLesson | undefined => {
  for (const storybook of demoStorybooks) {
    const lesson = storybook.lessons.find(l => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getDemoCurriculum = (): DemoCurriculum => {
  return demoCurriculum;
};

export const getDemoProgress = () => {
  return demoProgress;
};
