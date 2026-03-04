import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { computeSkillGap, generateRoadmapTasks } from '@/lib/skillEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Zap, ArrowLeft, Save, X, Plus } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'Other'];
const TIMELINES = [
  { value: 30, label: '30 Days (Sprint)' },
  { value: 60, label: '60 Days (Balanced)' },
  { value: 90, label: '90 Days (Deep Dive)' },
];
const PREFERENCES = ['Fast', 'Balanced', 'Strong Foundation'];

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [year, setYear] = useState<number>(0);
  const [branch, setBranch] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [originalTargetRole, setOriginalTargetRole] = useState('');
  const [timeline, setTimeline] = useState<number>(60);
  const [goalPref, setGoalPref] = useState('Balanced');
  const [manualSkills, setManualSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [profileRes, acadRes, roleRes] = await Promise.all([
        supabase.from('user_profile').select('*').eq('user_id', user.id).single(),
        supabase.from('student_academics').select('*').eq('user_id', user.id).single(),
        supabase.from('role_maps').select('role_name'),
      ]);

      if (profileRes.data) {
        setName(profileRes.data.name);
        setYear(profileRes.data.year || 0);
        setBranch(profileRes.data.branch || '');
        setTargetRole(profileRes.data.target_role || '');
        setOriginalTargetRole(profileRes.data.target_role || '');
        setTimeline(profileRes.data.timeline_days || 60);
        setGoalPref(profileRes.data.goal_preference || 'Balanced');
      }
      if (acadRes.data) {
        setManualSkills(acadRes.data.manual_skills || []);
      }
      if (roleRes.data) setRoles(roleRes.data.map(r => r.role_name));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const addSkill = () => {
    if (skillInput.trim() && !manualSkills.includes(skillInput.trim())) {
      setManualSkills([...manualSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase.from('user_profile').update({
        name,
        year,
        branch,
        target_role: targetRole,
        timeline_days: timeline,
        goal_preference: goalPref,
      }).eq('user_id', user.id);
      if (profileError) throw profileError;

      const { error: acadError } = await supabase.from('student_academics').update({
        manual_skills: manualSkills,
      }).eq('user_id', user.id);
      if (acadError) throw acadError;

      // If target role changed, regenerate roadmap
      if (targetRole !== originalTargetRole) {
        const [acadRes, subjectRes, roleRes] = await Promise.all([
          supabase.from('student_academics').select('*').eq('user_id', user.id).single(),
          supabase.from('subject_maps').select('*'),
          supabase.from('role_maps').select('*'),
        ]);

        if (acadRes.data && subjectRes.data && roleRes.data) {
          const roleMap = roleRes.data.find(r => r.role_name === targetRole);
          if (roleMap) {
            const gap = computeSkillGap(
              acadRes.data.subjects || [],
              acadRes.data.manual_skills || [],
              subjectRes.data,
              roleMap
            );
            await supabase.from('roadmap_tasks').delete().eq('user_id', user.id);
            const newTasks = generateRoadmapTasks(gap.missingSkills, gap.coreMissingSkills, timeline);
            const inserts = newTasks.map(t => ({ ...t, user_id: user.id }));
            if (inserts.length > 0) {
              await supabase.from('roadmap_tasks').insert(inserts);
            }
            toast.success('Profile updated & roadmap regenerated!');
          } else {
            toast.success('Profile updated!');
          }
        }
      } else {
        toast.success('Profile updated!');
      }

      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mx-auto mb-3">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display gradient-text">LevelUp</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <main className="container py-6 max-w-lg">
        <Card className="shadow-card border-border animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-lg">Edit Profile</CardTitle>
            <CardDescription>Update your information. Changing your target role will regenerate your roadmap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetRole !== originalTargetRole && (
                <p className="text-xs text-warning">⚠️ Changing role will regenerate your roadmap</p>
              )}
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
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
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

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1 gradient-primary text-primary-foreground gap-1">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditProfilePage;
