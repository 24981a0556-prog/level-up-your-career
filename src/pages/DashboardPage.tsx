import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { computeSkillGap, generateRoadmapTasks, SkillGapResult } from '@/lib/skillEngine';
import { DEMO_PROFILE, DEMO_ACADEMICS, DEMO_STREAK } from '@/lib/demoData';
import ReadinessScore from '@/components/ReadinessScore';
import SkillChips from '@/components/SkillChips';
import RoadmapSection from '@/components/RoadmapSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Zap, LogOut, Flame, Target, BookOpen, TrendingUp,
  RefreshCw, Sparkles, Play, User, GraduationCap, Calendar,
  Edit, RotateCcw
} from 'lucide-react';

interface ProfileData {
  name: string;
  year: number | null;
  branch: string | null;
  target_role: string | null;
  timeline_days: number | null;
  goal_preference: string | null;
}

interface AcademicData {
  subjects: string[] | null;
  manual_skills: string[] | null;
  certifications: string[] | null;
  projects: any;
  cgpa: number | null;
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  skill_tag: string | null;
  priority: string | null;
  week_number: number | null;
  estimated_time: string | null;
  is_completed: boolean | null;
  completed_at: string | null;
  user_id: string;
}

// Weighted scoring for task types
function getTaskWeight(title: string): number {
  const lower = title.toLowerCase();
  if (lower.startsWith('mini project') || lower.startsWith('mini project:')) return 10;
  if (lower.startsWith('practice')) return 5;
  if (lower.startsWith('learn')) return 3;
  return 3;
}

function computeWeightedReadiness(tasks: TaskRow[], baseScore: number): number {
  if (tasks.length === 0) return baseScore;
  const totalWeight = tasks.reduce((sum, t) => sum + getTaskWeight(t.title), 0);
  const completedWeight = tasks.filter(t => t.is_completed).reduce((sum, t) => sum + getTaskWeight(t.title), 0);
  if (totalWeight === 0) return baseScore;
  // Blend base skill-gap score with task completion progress
  const taskProgress = (completedWeight / totalWeight) * 100;
  // Weighted: 40% base skill match + 60% task completion
  const blended = Math.round(baseScore * 0.4 + taskProgress * 0.6);
  return Math.min(100, blended);
}

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [academics, setAcademics] = useState<AcademicData | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [streak, setStreak] = useState({ streak_count: 0, last_completed_date: '' });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dynamicReadiness, setDynamicReadiness] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, acadRes, tasksRes, streakRes, subjectRes, roleRes] = await Promise.all([
      supabase.from('user_profile').select('*').eq('user_id', user.id).single(),
      supabase.from('student_academics').select('*').eq('user_id', user.id).single(),
      supabase.from('roadmap_tasks').select('*').eq('user_id', user.id).order('week_number'),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('subject_maps').select('*'),
      supabase.from('role_maps').select('*'),
    ]);

    if (!profileRes.data) {
      navigate('/onboarding');
      return;
    }

    setProfile(profileRes.data);
    setAcademics(acadRes.data);
    setTasks(tasksRes.data || []);
    setStreak(streakRes.data || { streak_count: 0, last_completed_date: '' });

    if (acadRes.data && profileRes.data.target_role && roleRes.data && subjectRes.data) {
      const roleMap = roleRes.data.find(r => r.role_name === profileRes.data.target_role);
      if (roleMap) {
        const gap = computeSkillGap(
          acadRes.data.subjects || [],
          acadRes.data.manual_skills || [],
          subjectRes.data,
          roleMap
        );
        setSkillGap(gap);
        setDynamicReadiness(computeWeightedReadiness(tasksRes.data || [], gap.readinessScore));
      }
    }

    setLoading(false);
  }, [user, navigate]);

  useEffect(() => {
    if (!isDemoMode) loadData();
  }, [loadData, isDemoMode]);

  const handleGenerateRoadmap = async () => {
    if (!user || !skillGap || !profile?.timeline_days) return;
    setGenerating(true);

    try {
      await supabase.from('roadmap_tasks').delete().eq('user_id', user.id);
      const newTasks = generateRoadmapTasks(skillGap.missingSkills, skillGap.coreMissingSkills, profile.timeline_days);
      const inserts = newTasks.map(t => ({ ...t, user_id: user.id }));
      const { error } = await supabase.from('roadmap_tasks').insert(inserts);
      if (error) throw error;
      toast.success('Roadmap generated!');
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!user) return;
    const now = new Date();

    await supabase.from('roadmap_tasks').update({
      is_completed: completed,
      completed_at: completed ? now.toISOString() : null,
    }).eq('id', taskId);

    // Update streak
    const today = now.toISOString().split('T')[0];
    const currentStreak = streak;
    let newCount = currentStreak.streak_count || 0;

    if (completed) {
      if (currentStreak.last_completed_date !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (currentStreak.last_completed_date === yesterdayStr || !currentStreak.last_completed_date) {
          newCount += 1;
        } else {
          newCount = 1;
        }
        await supabase.from('streaks').upsert({
          user_id: user.id,
          streak_count: newCount,
          last_completed_date: today,
        });
      }
    }

    // Refresh tasks and streak
    const { data } = await supabase.from('roadmap_tasks').select('*').eq('user_id', user.id).order('week_number');
    const updatedTasks = data || [];
    setTasks(updatedTasks);
    const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    if (streakData) setStreak(streakData);

    // Update readiness score dynamically
    if (skillGap) {
      const newReadiness = computeWeightedReadiness(updatedTasks, skillGap.readinessScore);
      setDynamicReadiness(newReadiness);
    }
  };

  const handleRedoAssessment = async () => {
    if (!user) return;
    try {
      // Reset academics
      await supabase.from('student_academics').update({
        subjects: [],
        manual_skills: [],
        certifications: [],
        projects: [],
        cgpa: null,
      }).eq('user_id', user.id);

      // Delete profile so onboarding re-creates it
      await supabase.from('user_profile').delete().eq('user_id', user.id);

      // Delete tasks and reset streak
      await Promise.all([
        supabase.from('roadmap_tasks').delete().eq('user_id', user.id),
        supabase.from('streaks').update({ streak_count: 0 }).eq('user_id', user.id),
      ]);

      toast.success('Assessment reset! Redirecting to onboarding...');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const activateDemo = async () => {
    if (!user) return;
    setIsDemoMode(true);
    setLoading(true);

    try {
      await supabase.from('user_profile').upsert({
        user_id: user.id,
        ...DEMO_PROFILE,
      }, { onConflict: 'user_id' });

      await supabase.from('student_academics').upsert({
        user_id: user.id,
        ...DEMO_ACADEMICS,
      }, { onConflict: 'user_id' });

      await supabase.from('streaks').upsert({
        user_id: user.id,
        ...DEMO_STREAK,
      }, { onConflict: 'user_id' });

      const subjectRes = await supabase.from('subject_maps').select('*');
      const roleRes = await supabase.from('role_maps').select('*');

      if (subjectRes.data && roleRes.data) {
        const roleMap = roleRes.data.find(r => r.role_name === DEMO_PROFILE.target_role);
        if (roleMap) {
          const gap = computeSkillGap(
            DEMO_ACADEMICS.subjects,
            DEMO_ACADEMICS.manual_skills,
            subjectRes.data,
            roleMap
          );
          setSkillGap(gap);

          await supabase.from('roadmap_tasks').delete().eq('user_id', user.id);
          const newTasks = generateRoadmapTasks(gap.missingSkills, gap.coreMissingSkills, DEMO_PROFILE.timeline_days);
          const inserts = newTasks.map(t => ({ ...t, user_id: user.id }));
          const completedInserts = inserts.map((t, i) => ({
            ...t,
            is_completed: i < 6,
            completed_at: i < 6 ? new Date().toISOString() : null,
          }));
          await supabase.from('roadmap_tasks').insert(completedInserts);
        }
      }

      toast.success('Demo mode activated!');
      await loadData();
      setIsDemoMode(false);
    } catch (err: any) {
      toast.error(err.message);
      setIsDemoMode(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary mx-auto mb-3 animate-streak-pulse">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display gradient-text">LevelUp</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={activateDemo}>
              <Play className="h-3.5 w-3.5" /> Demo
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Profile Summary + Readiness Score */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card border-border md:col-span-2 animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" /> Profile Summary
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate('/edit-profile')}>
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={handleRedoAssessment}>
                    <RotateCcw className="h-3 w-3" /> Re-do Assessment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium text-sm">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="font-medium text-sm">{profile?.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" />Year</p>
                  <p className="font-medium text-sm">Year {profile?.year}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" />Target</p>
                  <p className="font-medium text-sm">{profile?.target_role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Timeline</p>
                  <p className="font-medium text-sm">{profile?.timeline_days} days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preference</p>
                  <Badge variant="outline" className="text-xs">{profile?.goal_preference}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ReadinessScore score={dynamicReadiness} />
            </CardContent>
          </Card>
        </div>

        {/* Skills Overview */}
        {skillGap && (
          <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillChips title="✅ Skills You Have" skills={skillGap.matchedSkills} variant="matched" />
              <SkillChips title="📋 Required Skills" skills={skillGap.requiredSkills} variant="required" />
              <SkillChips title="❌ Missing Skills" skills={skillGap.missingSkills} variant="missing" />
              <SkillChips title="⚡ Core Missing (High Priority)" skills={skillGap.coreMissingSkills} variant="core-missing" />
            </CardContent>
          </Card>
        )}

        {/* Progress + Streak */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Roadmap Progress</p>
              <p className="text-2xl font-bold font-display">{completionPercent}%</p>
              <Progress value={completionPercent} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold font-display">{completedCount}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">tasks done</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="pt-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Streak</p>
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-6 w-6 text-warning animate-streak-pulse" />
                <span className="text-2xl font-bold font-display">{streak.streak_count}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">day{(streak.streak_count || 0) !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        </div>

        {/* Readiness Score Detail */}
        <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium font-display">Career Readiness</p>
              <p className="text-sm font-bold text-primary">{dynamicReadiness}%</p>
            </div>
            <Progress value={dynamicReadiness} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Complete tasks to increase your score. Learn tasks: +3pts, Practice: +5pts, Mini Projects: +10pts
            </p>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="shadow-card border-border animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Roadmap
              </CardTitle>
              <div className="flex gap-2">
                {tasks.length === 0 ? (
                  <Button size="sm" className="gap-1 gradient-primary text-primary-foreground" onClick={handleGenerateRoadmap} disabled={generating}>
                    <Sparkles className="h-3.5 w-3.5" /> {generating ? 'Generating...' : 'Generate Roadmap'}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1" onClick={handleGenerateRoadmap} disabled={generating}>
                    <RefreshCw className="h-3.5 w-3.5" /> {generating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <RoadmapSection tasks={tasks} onToggleTask={handleToggleTask} />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Generate your personalized roadmap to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;
