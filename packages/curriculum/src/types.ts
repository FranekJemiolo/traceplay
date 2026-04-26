export interface Lesson {
  id: string;
  title: string;
  shapes: any[];
  skills: string[];
}

export interface Module {
  id: string;
  lessons: Lesson[];
}

export interface SkillGraph {
  [skill: string]: string[];
}

export interface Curriculum {
  modules: Module[];
  skillGraph: SkillGraph;
}
