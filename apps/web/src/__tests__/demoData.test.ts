import {
  demoStorybooks,
  demoCurriculum,
  demoProgress,
  getDemoStorybookById,
  getDemoLessonById,
  getDemoCurriculum,
  getDemoProgress,
  type DemoLesson,
  type DemoStorybook,
  type DemoModule,
} from '../lib/demoData';

describe('Demo Data Provider', () => {
  describe('demoStorybooks', () => {
    it('should have at least one storybook', () => {
      expect(demoStorybooks.length).toBeGreaterThan(0);
    });

    it('each storybook should have required fields', () => {
      demoStorybooks.forEach((storybook: DemoStorybook) => {
        expect(storybook).toHaveProperty('id');
        expect(storybook).toHaveProperty('title');
        expect(storybook).toHaveProperty('description');
        expect(storybook).toHaveProperty('imageUrl');
        expect(storybook).toHaveProperty('lessons');
        expect(storybook).toHaveProperty('createdAt');
        expect(Array.isArray(storybook.lessons)).toBe(true);
      });
    });

    it('each lesson should have required fields', () => {
      demoStorybooks.forEach((storybook: DemoStorybook) => {
        storybook.lessons.forEach((lesson: DemoLesson) => {
          expect(lesson).toHaveProperty('id');
          expect(lesson).toHaveProperty('title');
          expect(lesson).toHaveProperty('order');
          expect(lesson).toHaveProperty('imageUrl');
          expect(lesson).toHaveProperty('description');
          expect(lesson).toHaveProperty('difficulty');
          expect(lesson).toHaveProperty('estimatedTime');
          expect(['beginner', 'intermediate', 'advanced']).toContain(lesson.difficulty);
        });
      });
    });
  });

  describe('demoCurriculum', () => {
    it('should have required fields', () => {
      expect(demoCurriculum).toHaveProperty('id');
      expect(demoCurriculum).toHaveProperty('title');
      expect(demoCurriculum).toHaveProperty('description');
      expect(demoCurriculum).toHaveProperty('modules');
      expect(demoCurriculum).toHaveProperty('totalLessons');
      expect(demoCurriculum).toHaveProperty('totalSkills');
    });

    it('should have at least one module', () => {
      expect(demoCurriculum.modules.length).toBeGreaterThan(0);
    });

    it('each module should have required fields', () => {
      demoCurriculum.modules.forEach((module: DemoModule) => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('title');
        expect(module).toHaveProperty('description');
        expect(module).toHaveProperty('order');
        expect(module).toHaveProperty('lessons');
        expect(module).toHaveProperty('skills');
        expect(Array.isArray(module.lessons)).toBe(true);
        expect(Array.isArray(module.skills)).toBe(true);
      });
    });

    it('totalLessons should match sum of module lessons', () => {
      const actualTotal = demoCurriculum.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );
      expect(demoCurriculum.totalLessons).toBe(actualTotal);
    });

    it('totalSkills should match sum of unique module skills', () => {
      const allSkills = demoCurriculum.modules.flatMap((m) => m.skills);
      const uniqueSkills = new Set(allSkills);
      expect(demoCurriculum.totalSkills).toBe(uniqueSkills.size);
    });
  });

  describe('demoProgress', () => {
    it('should have required fields', () => {
      expect(demoProgress).toHaveProperty('completedLessons');
      expect(demoProgress).toHaveProperty('inProgressLessons');
      expect(demoProgress).toHaveProperty('totalLessons');
      expect(demoProgress).toHaveProperty('completionRate');
      expect(demoProgress).toHaveProperty('averageScore');
    });

    it('completionRate should be calculated correctly', () => {
      const expectedRate = (demoProgress.completedLessons.length / demoProgress.totalLessons) * 100;
      expect(demoProgress.completionRate).toBeCloseTo(expectedRate, 2);
    });
  });

  describe('Helper Functions', () => {
    it('getDemoStorybookById should return correct storybook', () => {
      const storybook = getDemoStorybookById('storybook-1');
      expect(storybook).toBeDefined();
      expect(storybook?.id).toBe('storybook-1');
    });

    it('getDemoStorybookById should return undefined for invalid id', () => {
      const storybook = getDemoStorybookById('invalid-id');
      expect(storybook).toBeUndefined();
    });

    it('getDemoLessonById should return correct lesson', () => {
      const lesson = getDemoLessonById('lesson-1');
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe('lesson-1');
    });

    it('getDemoLessonById should return undefined for invalid id', () => {
      const lesson = getDemoLessonById('invalid-id');
      expect(lesson).toBeUndefined();
    });

    it('getDemoCurriculum should return curriculum', () => {
      const curriculum = getDemoCurriculum();
      expect(curriculum).toEqual(demoCurriculum);
    });

    it('getDemoProgress should return progress', () => {
      const progress = getDemoProgress();
      expect(progress).toEqual(demoProgress);
    });
  });
});
