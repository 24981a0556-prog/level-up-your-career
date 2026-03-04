interface ReadinessScoreProps {
  score: number;
}

const ReadinessScore = ({ score }: ReadinessScoreProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return 'hsl(var(--success))';
    if (score >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getLabel = () => {
    if (score >= 75) return 'Strong Match';
    if (score >= 50) return 'Getting There';
    if (score >= 25) return 'Needs Work';
    return 'Just Starting';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ '--score-offset': offset, transition: 'stroke-dashoffset 1.5s ease-out' } as any}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display">{score}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{getLabel()}</span>
    </div>
  );
};

export default ReadinessScore;
