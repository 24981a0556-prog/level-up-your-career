import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Zap, ChevronRight, ChevronLeft, GraduationCap, BookOpen, Code, Target, X, Plus } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'Other'];
const TIMELINES = [
  { value: 30, label: '30 Days (Sprint)' },
  { value: 60, label: '60 Days (Balanced)' },
  { value: 90, label: '90 Days (Deep Dive)' },
];
const PREFERENCES = ['Fast', 'Balanced', 'Strong Foundation'];

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [year, setYear] = useState<number>(0);
  const [branch, setBranch] = useState('');

  // Step 2
  const [subjects, setSubjects] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [cgpa, setCgpa] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Step 3
  const [manualSkills, setManualSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [projects, setProjects] = useState<{ title: string; tech_stack: string; description: string }[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTech, setProjectTech] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Step 4
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState<number>(60);
  const [goalPref, setGoalPref] = useState('Balanced');
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [subRes, roleRes] = await Promise.all([
        supabase.from('subject_maps').select('subject_name'),
        supabase.from('role_maps').select('role_name'),
      ]);
      if (subRes.data) setAvailableSubjects(subRes.data.map(s => s.subject_name));
      if (roleRes.data) setRoles(roleRes.data.map(r => r.role_name));
    };
    fetchData();
  }, []);

  const toggleSubject = (sub: string) => {
    setSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const addCert = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !manualSkills.includes(skillInput.trim())) {
      setManualSkills([...manualSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addProject = () => {
    if (projectTitle.trim()) {
      setProjects([...projects, { title: projectTitle, tech_stack: projectTech, description: projectDesc }]);
      setProjectTitle('');
      setProjectTech('');
      setProjectDesc('');
    }
  };

const handleComplete = async () => {
  if (!user) return;

  console.log("USER:", user); // ✅ ADD THIS LINE HERE

  setLoading(true);
  try {
      const { error: profileError } = await supabase.from('user_profile').upsert({
        user_id: user.id,
        name,
        year,
        branch,
        target_role: targetRole,
        timeline_days: timeline,
        goal_preference: goalPref,
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;

      const { error: acadError } = await supabase.from('student_academics').upsert({
        user_id: user.id,
        subjects,
        certifications,
        manual_skills: manualSkills,
        projects,
        cgpa: cgpa ? parseFloat(cgpa) : null,
      }, { onConflict: 'user_id' });
      if (acadError) throw acadError;

      // Initialize or reset streak
      await supabase.from('streaks').upsert({ user_id: user.id, streak_count: 0 }, { onConflict: 'user_id' });

      toast.success('Profile created! Welcome to LevelUp!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [GraduationCap, BookOpen, Code, Target];
  const stepLabels = ['Profile', 'Academics', 'Skills', 'Goal'];

const canNext = () => {
  if (step === 1) return name.trim() && year > 0 && branch;
  if (step === 2) return true; 
  if (step === 3) return true;
  if (step === 4) return targetRole && timeline && goalPref;
  return false;
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display gradient-text">LevelUp</h1>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {stepLabels.map((label, idx) => {
            const Icon = stepIcons[idx];
            const isActive = step === idx + 1;
            const isDone = step > idx + 1;
            return (
              <div key={label} className="flex items-center gap-1">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${isActive ? 'gradient-primary text-primary-foreground' : isDone ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {idx < 3 && <div className={`h-0.5 w-6 transition-all ${isDone ? 'bg-success' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              {step === 1 && 'Academic Profile'}
              {step === 2 && 'Academic Learning'}
              {step === 3 && 'Skills & Projects'}
              {step === 4 && 'Career Goal'}
            </CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label>College Year</Label>
                  <Select value={year ? String(year) : ''} onValueChange={v => setYear(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(y => (
                        <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Subjects Completed</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map(sub => (
                      <Badge
                        key={sub}
                        variant={subjects.includes(sub) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${subjects.includes(sub) ? 'gradient-primary text-primary-foreground border-transparent' : 'hover:bg-muted'}`}
                        onClick={() => toggleSubject(sub)}
                      >
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Certifications (optional)</Label>
                  <div className="flex gap-2">
                    <Input value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="e.g. AWS Cloud" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
                    <Button type="button" variant="outline" size="icon" onClick={addCert}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {certifications.map(c => (
                      <Badge key={c} variant="secondary" className="gap-1">
                        {c}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCertifications(certifications.filter(x => x !== c))} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CGPA (optional)</Label>
                  <Input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="e.g. 8.5" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Known Skills</Label>
                  <div className="flex gap-2">
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="e.g. React, Python" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <Button type="button" variant="outline" size="icon" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {manualSkills.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setManualSkills(manualSkills.filter(x => x !== s))} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Projects</Label>
                  <div className="space-y-2 rounded-lg border border-border p-3">
                    <Input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Project title" />
                    <Input value={projectTech} onChange={e => setProjectTech(e.target.value)} placeholder="Tech stack" />
                    <Input value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="Brief description" />
                    <Button type="button" variant="outline" size="sm" onClick={addProject} disabled={!projectTitle.trim()}>
                      <Plus className="mr-1 h-3 w-3" /> Add Project
                    </Button>
                  </div>
                  {projects.map((p, i) => (
                    <div key={i} className="flex items-start justify-between rounded-lg border border-border p-2 text-sm">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-muted-foreground text-xs">{p.tech_stack}</p>
                      </div>
                      <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setProjects(projects.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger><SelectValue placeholder="Select your dream role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Select value={String(timeline)} onValueChange={v => setTimeline(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map(t => (
                        <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Goal Preference</Label>
                  <div className="flex gap-2">
                    {PREFERENCES.map(p => (
                      <Badge
                        key={p}
                        variant={goalPref === p ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${goalPref === p ? 'gradient-primary text-primary-foreground border-transparent' : 'hover:bg-muted'}`}
                        onClick={() => setGoalPref(p)}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <div className="flex-1" />
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-1 gradient-primary text-primary-foreground">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || !canNext()} className="gap-1 gradient-primary text-primary-foreground">
                  {loading ? 'Saving...' : 'Launch Dashboard 🚀'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
