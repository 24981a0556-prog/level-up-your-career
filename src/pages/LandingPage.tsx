import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Zap, Target, TrendingUp, BookOpen, ArrowRight,
  ClipboardCheck, Route, BarChart3, Youtube
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: ClipboardCheck, title: 'Complete Career Assessment', desc: 'Tell us about your skills, academics, and career goals.' },
    { icon: Route, title: 'Get Personalized Roadmap', desc: 'AI generates a structured plan to close your skill gap.' },
    { icon: BarChart3, title: 'Track Progress & Level Up', desc: 'Complete tasks, build streaks, and increase your readiness score.' },
  ];

  const features = [
    { icon: Target, title: 'AI Skill Gap Analysis', desc: 'Identify exactly which skills you need to land your dream role.' },
    { icon: Route, title: 'Career Roadmaps', desc: 'Structured 30/60/90 day plans tailored to your goals.' },
    { icon: TrendingUp, title: 'Readiness Score Tracking', desc: 'Watch your career readiness grow as you complete tasks.' },
    { icon: Youtube, title: 'Curated Learning Resources', desc: 'YouTube tutorials and resources linked to every task.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display gradient-text">LevelUp</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>Login</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate('/auth?mode=signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-32 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" /> AI-Powered Career Readiness
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
            Turn Your Career Goals{' '}
            <span className="gradient-text">Into Action Plans</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Personalized career roadmap powered by AI. Track skills. Improve readiness. Get job-ready faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gradient-primary text-primary-foreground gap-2 text-base px-8" onClick={() => navigate('/auth?mode=signup')}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8" onClick={() => navigate('/auth?mode=login')}>
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">How It Works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to career readiness</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <Card key={i} className="shadow-card border-border text-center relative overflow-hidden group hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">Features</h2>
          <p className="text-muted-foreground text-lg">Everything you need to level up your career</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <Card key={i} className="shadow-card border-border hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-6 pb-5 px-6 flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container py-16 md:py-24 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl gradient-primary p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-primary-foreground mb-3">
            Ready to Level Up?
          </h2>
          <p className="text-primary-foreground/80 mb-6">Start your personalized career journey today.</p>
          <Button size="lg" variant="secondary" className="gap-2 text-base px-8" onClick={() => navigate('/auth?mode=signup')}>
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LevelUp. Built for your career growth.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
