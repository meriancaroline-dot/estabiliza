import { cn } from "@/lib/utils";

interface MoodEmojiProps {
  mood: 1 | 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const moodConfig = {
  1: { emoji: "😢", label: "Muito triste", color: "text-destructive" },
  2: { emoji: "😟", label: "Triste", color: "text-chart-5" },
  3: { emoji: "😐", label: "Neutro", color: "text-muted-foreground" },
  4: { emoji: "🙂", label: "Feliz", color: "text-chart-4" },
  5: { emoji: "😊", label: "Muito feliz", color: "text-accent" },
};

const sizeConfig = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

export function MoodEmoji({ mood, size = "md", className }: MoodEmojiProps) {
  const config = moodConfig[mood];
  
  return (
    <span className={cn(sizeConfig[size], config.color, className)} aria-label={config.label}>
      {config.emoji}
    </span>
  );
}
