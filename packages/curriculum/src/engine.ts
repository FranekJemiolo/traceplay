import { Lesson, Module, Curriculum, SkillGraph } from './types';

function generateId(): string {
  return `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function buildCurriculum(lessons: Lesson[]): Curriculum {
  const modules: Module[] = [];
  const size = 5;

  for (let i = 0; i < lessons.length; i += size) {
    modules.push({
      id: generateId(),
      lessons: lessons.slice(i, i + size),
    });
  }

  const skillGraph: SkillGraph = {};

  lessons.forEach((l, i) => {
    // If lesson defines explicit skills, use them; otherwise establish linear mastery graph
    if (l.skills && l.skills.length > 0) {
      skillGraph[l.title] = l.skills;
    } else {
      skillGraph[l.title] = lessons.slice(i + 1, i + 2).map(x => x.title);
    }
  });

  return { modules, skillGraph };
}

export function getUnlockedLessons(
  completedLessonIds: string[],
  allLessons: Lesson[]
): Lesson[] {
  const completedSet = new Set(completedLessonIds);
  return allLessons.filter((lesson, index) => {
    // First lesson is always unlocked
    if (index === 0) return true;
    // If already completed, it is unlocked
    if (completedSet.has(lesson.id)) return true;
    // If previous lesson was completed, next is unlocked
    const prevLesson = allLessons[index - 1];
    return prevLesson ? completedSet.has(prevLesson.id) : true;
  });
}

export function calculateCurriculumProgress(
  completedLessonIds: string[],
  totalLessons: number
): { percent: number; completedCount: number; remainingCount: number } {
  const count = completedLessonIds.length;
  const safeTotal = Math.max(totalLessons, 1);
  const percent = Math.min(100, Math.round((count / safeTotal) * 100));
  return {
    percent,
    completedCount: count,
    remainingCount: Math.max(0, safeTotal - count),
  };
}
