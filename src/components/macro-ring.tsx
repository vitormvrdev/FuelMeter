"use client";

interface MacroRingProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
}

export function MacroRing({ label, current, goal, unit = "g", color }: MacroRingProps) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[76px] w-[76px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 76 76">
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth="6"
          />
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(current)}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        / {Math.round(goal)}{unit === "kcal" ? "" : unit}
      </span>
    </div>
  );
}
