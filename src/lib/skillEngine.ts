export interface SkillGapResult {
  studentSkills: string[];
  requiredSkills: string[];
  coreSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  coreMissingSkills: string[];
  readinessScore: number;
}

export function computeSkillGap(
  subjects: string[],
  manualSkills: string[],
  subjectMaps: { subject_name: string; skill_tags: string[] | null }[],
  roleMap: { required_skills: string[] | null; core_skills: string[] | null }
): SkillGapResult {
  // Derive skills from subjects
  const skillsFromSubjects = new Set<string>();
  for (const subject of subjects) {
    const map = subjectMaps.find(s => s.subject_name === subject);
    if (map?.skill_tags) {
      map.skill_tags.forEach(skill => skillsFromSubjects.add(skill));
    }
  }

  // Union with manual skills
  const totalStudentSkills = new Set([...skillsFromSubjects, ...manualSkills]);
  const studentSkillsArr = Array.from(totalStudentSkills);

  const requiredSkills = roleMap.required_skills ?? [];
  const coreSkills = roleMap.core_skills ?? [];

  const matchedSkills = requiredSkills.filter(s => totalStudentSkills.has(s));
  const missingSkills = requiredSkills.filter(s => !totalStudentSkills.has(s));
  const coreMissingSkills = coreSkills.filter(s => !totalStudentSkills.has(s));

  const readinessScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    studentSkills: studentSkillsArr,
    requiredSkills,
    coreSkills,
    matchedSkills,
    missingSkills,
    coreMissingSkills,
    readinessScore,
  };
}

export interface RoadmapTask {
  title: string;
  description: string;
  skill_tag: string;
  priority: string;
  week_number: number;
  estimated_time: string;
}

export function generateRoadmapTasks(
  missingSkills: string[],
  coreMissingSkills: string[],
  timelineDays: number
): RoadmapTask[] {
  const totalWeeks = Math.floor(timelineDays / 7.5);
  const tasks: RoadmapTask[] = [];
  const coreSet = new Set(coreMissingSkills);

  // Sort: core skills first
  const sorted = [...missingSkills].sort((a, b) => {
    const aCore = coreSet.has(a) ? 0 : 1;
    const bCore = coreSet.has(b) ? 0 : 1;
    return aCore - bCore;
  });

  sorted.forEach((skill, idx) => {
    const priority = coreSet.has(skill) ? 'High' : (idx < sorted.length / 2 ? 'Medium' : 'Low');
    const estTime = priority === 'High' ? '2 hrs' : priority === 'Medium' ? '1 hr' : '30 min';
    const baseWeek = Math.floor((idx * totalWeeks) / sorted.length) + 1;

    tasks.push({
      title: `Learn ${skill}`,
      description: `Study the fundamentals of ${skill}. Watch tutorials, read documentation, and understand core concepts.`,
      skill_tag: skill,
      priority,
      week_number: Math.min(baseWeek, totalWeeks),
      estimated_time: estTime,
    });

    tasks.push({
      title: `Practice ${skill}`,
      description: `Solve practice problems and exercises related to ${skill}. Apply what you've learned.`,
      skill_tag: skill,
      priority,
      week_number: Math.min(baseWeek + 1, totalWeeks),
      estimated_time: estTime,
    });

    tasks.push({
      title: `Mini Project: ${skill}`,
      description: `Build a small project using ${skill} to solidify your understanding and add to your portfolio.`,
      skill_tag: skill,
      priority,
      week_number: Math.min(baseWeek + 2, totalWeeks),
      estimated_time: estTime,
    });
  });

  return tasks;
}
