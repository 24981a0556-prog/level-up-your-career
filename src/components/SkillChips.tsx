import { Badge } from '@/components/ui/badge';

interface SkillChipsProps {
  title: string;
  skills: string[];
  variant: 'matched' | 'required' | 'missing' | 'core-missing';
}

const variantStyles: Record<string, string> = {
  matched: 'bg-success/15 text-success border-success/30',
  required: 'bg-muted text-muted-foreground border-border',
  missing: 'bg-destructive/15 text-destructive border-destructive/30',
  'core-missing': 'bg-destructive/20 text-destructive border-destructive/50 font-semibold',
};

const SkillChips = ({ title, skills, variant }: SkillChipsProps) => {
  if (skills.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {skills.map(skill => (
          <Badge
            key={skill}
            variant="outline"
            className={`text-xs ${variantStyles[variant]}`}
          >
            {variant === 'core-missing' && '⚡ '}
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillChips;
