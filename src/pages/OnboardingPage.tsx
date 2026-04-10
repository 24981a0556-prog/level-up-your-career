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

// ✅ Fallback data
const DEFAULT_SUBJECTS = ['DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP'];
const DEFAULT_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
];

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

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
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTech, setProjectTech] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Step 4
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState<number>(60);
  const [goalPref, setGoalPref] = useState('Balanced');
  const [roles, setRoles] = useState<string[]>([]);

  // ✅ Safe fetch with fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, roleRes] = await Promise.all([
          supabase.from('subject_maps').select('subject_name'),
          supabase.from('role_maps').select('role_name'),
        ]);

        setAvailableSubjects(
          subRes.data && subRes.data.length > 0
            ? subRes.data.map(s => s.subject_name)
            : DEFAULT_SUBJECTS
        );

        setRoles(
          roleRes.data && roleRes.data.length > 0
            ? roleRes.data.map(r => r.role_name)
            : DEFAULT_ROLES
        );

      } catch {
        setAvailableSubjects(DEFAULT_SUBJECTS);
        setRoles(DEFAULT_ROLES);
      }
    };

    fetchData();
  }, []);

  const toggleSubject = (sub: string) => {
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const addCert = () => {
    if (certInput.trim()) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setManualSkills([...manualSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addProject = () => {
    if (projectTitle.trim()) {
      setProjects([
        ...projects,
        { title: projectTitle, tech_stack: projectTech, description: projectDesc },
      ]);
      setProjectTitle('');
      setProjectTech('');
      setProjectDesc('');
    }
  };

  // ✅ No DB save (temporary)
  const handleComplete = async () => {
    toast.success('Profile created! (local mode)');
    navigate('/dashboard');
  };

  const canNext = () => {
    if (step === 1) return name.trim() && year > 0 && branch;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return targetRole && timeline && goalPref;
    return false;
  };

  const stepIcons = [GraduationCap, BookOpen, Code, Target];
  const stepLabels = ['Profile', 'Academics', 'Skills', 'Goal'];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="flex justify-center gap-2">
            <Zap />
            <h1>LevelUp</h1>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          {stepLabels.map((_, i) => (
            <div key={i} className={`mx-1 ${step === i + 1 ? 'font-bold' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {step}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {step === 1 && (
              <>
                <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Year" type="number" onChange={e => setYear(Number(e.target.value))} />
                <Input placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} />
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map(s => (
                    <Badge key={s} onClick={() => toggleSubject(s)}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Input placeholder="Skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
                <Button onClick={addSkill}>Add Skill</Button>
              </>
            )}

            {step === 4 && (
              <>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <div className="flex justify-between">
              {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Finish
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
