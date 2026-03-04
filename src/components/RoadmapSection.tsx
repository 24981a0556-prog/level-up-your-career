import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  skill_tag: string | null;
  priority: string | null;
  week_number: number | null;
  estimated_time: string | null;
  is_completed: boolean | null;
}

interface RoadmapSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string, completed: boolean) => void;
}

const priorityColors: Record<string, string> = {
  High: 'bg-destructive/15 text-destructive border-destructive/30',
  Medium: 'bg-warning/15 text-warning border-warning/30',
  Low: 'bg-muted text-muted-foreground border-border',
};

function buildYouTubeSearchUrl(title: string): string {
  const query = encodeURIComponent(title);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

const RoadmapSection = ({ tasks, onToggleTask }: RoadmapSectionProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  const weeks = Array.from(new Set(tasks.map(t => t.week_number ?? 1))).sort((a, b) => a - b);

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {weeks.map(week => {
        const weekTasks = tasks.filter(t => (t.week_number ?? 1) === week);
        const completed = weekTasks.filter(t => t.is_completed).length;
        const expanded = expandedWeeks.has(week);

        return (
          <Card key={week} className="shadow-card border-border overflow-hidden">
            <CardHeader
              className="cursor-pointer py-3 px-4"
              onClick={() => toggleWeek(week)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  Week {week}
                  <Badge variant="outline" className="text-xs">
                    {completed}/{weekTasks.length}
                  </Badge>
                </CardTitle>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
            {expanded && (
              <CardContent className="pt-0 px-4 pb-3 space-y-2">
                {weekTasks.map(task => {
                  const ytUrl = buildYouTubeSearchUrl(task.title);
                  const linkValid = isValidUrl(ytUrl);

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 rounded-lg border border-border p-3 transition-all ${task.is_completed ? 'opacity-60' : ''}`}
                    >
                      <Checkbox
                        checked={!!task.is_completed}
                        onCheckedChange={(checked) => onToggleTask(task.id, !!checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.is_completed ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {task.skill_tag && (
                            <Badge variant="outline" className="text-xs">{task.skill_tag}</Badge>
                          )}
                          {task.priority && (
                            <Badge variant="outline" className={`text-xs ${priorityColors[task.priority] || ''}`}>
                              {task.priority}
                            </Badge>
                          )}
                          {task.estimated_time && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />{task.estimated_time}
                            </span>
                          )}
                          {linkValid && (
                            <a
                              href={ytUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default RoadmapSection;
