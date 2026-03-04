export const DEMO_PROFILE = {
  name: 'Alex Demo',
  year: 3,
  branch: 'CSE',
  target_role: 'Full Stack Developer',
  timeline_days: 60,
  goal_preference: 'Balanced',
};

export const DEMO_ACADEMICS = {
  subjects: ['DSA', 'DBMS', 'OOP', 'Web Tech'],
  certifications: ['AWS Cloud Practitioner'],
  manual_skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
  projects: [
    { title: 'Portfolio Website', tech_stack: 'HTML, CSS, JS', description: 'Personal portfolio' },
    { title: 'Todo App', tech_stack: 'React, Node.js', description: 'Full stack todo application' },
  ],
  cgpa: 8.2,
};

export const DEMO_STREAK = {
  streak_count: 5,
  last_completed_date: new Date().toISOString().split('T')[0],
};
