// Mock data provider for demo mode
// This provides rich sample data without requiring backend API calls

export interface DemoLesson {
  id: string;
  title: string;
  order: number;
  imageUrl: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  skills: string[];
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
    title: 'Feline Friends Adventure',
    description: 'Learn to trace adorable cats and kittens while mastering curved outlines and fine motor control.',
    imageUrl: '/cat_sample.png',
    createdAt: '2024-03-01',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Cute Cat Silhouette',
        order: 1,
        imageUrl: '/cat_sample.png',
        description: 'Trace the clean outline of a sitting kitten, focusing on pointed ears and curved tail.',
        difficulty: 'beginner',
        estimatedTime: 10,
        skills: ['Curved Outlines', 'Ear Geometry', 'Continuous Tracing'],
      },
      {
        id: 'lesson-2',
        title: 'Playful Kitten & Yarn',
        order: 2,
        imageUrl: '/cat_playful.png',
        description: 'Master dynamic loops and circular curves tracing a playful kitten batting at a ball of yarn.',
        difficulty: 'intermediate',
        estimatedTime: 15,
        skills: ['Circular Loops', 'Dynamic Poses', 'Precision Points'],
      },
      {
        id: 'lesson-3',
        title: 'Whiskers & Facial Contours',
        order: 3,
        imageUrl: '/cat_sample.png',
        description: 'Practice fine details, gentle arcs, and symmetry around the cat eyes and muzzle.',
        difficulty: 'intermediate',
        estimatedTime: 12,
        skills: ['Facial Symmetry', 'Fine Line Control', 'Eye Arcs'],
      },
    ],
  },
  {
    id: 'storybook-2',
    title: 'Animal Kingdom & Geometric Nature',
    description: 'Explore geometric patterns in nature, from turtle shells to wildlife contours.',
    imageUrl: '/generated_turtle.png',
    createdAt: '2024-03-10',
    lessons: [
      {
        id: 'lesson-4',
        title: 'Turtle Shell Hexagons',
        order: 1,
        imageUrl: '/generated_turtle.png',
        description: 'Trace the geometric scutes and protective domed shell of an ancient sea turtle.',
        difficulty: 'beginner',
        estimatedTime: 15,
        skills: ['Hexagonal Patterns', 'Convex Curves', 'Symmetry'],
      },
      {
        id: 'lesson-5',
        title: 'Flippers & Swimming Motions',
        order: 2,
        imageUrl: '/generated_turtle.png',
        description: 'Trace aerodynamic flippers and water glide trails.',
        difficulty: 'advanced',
        estimatedTime: 20,
        skills: ['Fluid Dynamics', 'Asymmetric Curves', 'Complex Contours'],
      },
    ],
  },
];

export const demoCurriculum: DemoCurriculum = {
  id: 'curriculum-1',
  title: 'Foundational Tracing & Drawing Curriculum',
  description: 'A structured, pedagogical path for developing fine motor dexterity, shape recognition, and creative confidence.',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Feline Friends & Basic Curves',
      description: 'Introduction to smooth organic curves and friendly animal shapes.',
      order: 1,
      lessons: demoStorybooks[0].lessons,
      skills: ['Fine Motor Control', 'Curved Outlines', 'Hand-Eye Coordination'],
    },
    {
      id: 'module-2',
      title: 'Module 2: Nature & Geometric Patterns',
      description: 'Connecting geometric regularity with organic living creatures.',
      order: 2,
      lessons: demoStorybooks[1].lessons,
      skills: ['Pattern Recognition', 'Spatial Reasoning', 'Complex Contours'],
    },
  ],
  totalLessons: 5,
  totalSkills: 6,
};

export const demoProgress = {
  completedLessons: ['lesson-1'],
  inProgressLessons: ['lesson-2'],
  totalLessons: 5,
  completionRate: 20,
  averageScore: 92,
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
