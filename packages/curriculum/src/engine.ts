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
    skillGraph[l.title] = lessons.slice(i + 1, i + 3).map(x => x.title);
  });

  return { modules, skillGraph };
}
