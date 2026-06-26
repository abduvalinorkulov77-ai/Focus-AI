import { 
  Brain, 
  BookOpen, 
  Code, 
  Flame, 
  Laptop, 
  Sparkles, 
  Target, 
  Coffee, 
  Music, 
  Dumbbell, 
  Clock, 
  CheckCircle, 
  Activity,
  Heart,
  Briefcase
} from "lucide-react";

export const ICON_MAP: Record<string, any> = {
  brain: Brain,
  book: BookOpen,
  code: Code,
  run: Dumbbell,
  laptop: Laptop,
  meditation: Sparkles,
  target: Target,
  coffee: Coffee,
  music: Music,
  flame: Flame,
  clock: Clock,
  activity: Activity,
  heart: Heart,
  briefcase: Briefcase,
};

export const COLOR_PRESETS = [
  { name: "Teal", text: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", btn: "bg-teal-600 hover:bg-teal-700", progress: "bg-teal-600", ripple: "rgba(13, 148, 136, 0.2)" },
  { name: "Crimson", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", btn: "bg-rose-600 hover:bg-rose-700", progress: "bg-rose-600", ripple: "rgba(225, 29, 72, 0.2)" },
  { name: "Amber", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", btn: "bg-amber-600 hover:bg-amber-700", progress: "bg-amber-600", ripple: "rgba(217, 119, 6, 0.2)" },
  { name: "Indigo", text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", btn: "bg-indigo-600 hover:bg-indigo-700", progress: "bg-indigo-600", ripple: "rgba(79, 70, 229, 0.2)" },
  { name: "Emerald", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", btn: "bg-emerald-600 hover:bg-emerald-700", progress: "bg-emerald-600", ripple: "rgba(5, 150, 105, 0.2)" },
  { name: "Purple", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", btn: "bg-violet-600 hover:bg-violet-700", progress: "bg-violet-600", ripple: "rgba(124, 58, 237, 0.2)" },
];

export const STATIC_IMAGES = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=60", // Meditation
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=60", // Writing
  "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&auto=format&fit=crop&q=60", // Coding
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=60", // Fitness
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=60", // Book
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&auto=format&fit=crop&q=60", // Laptop Workspace
];

/**
 * Formats seconds into HH:MM:SS format
 */
export function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
}

/**
 * Formats seconds into human-readable Uzbek time representation
 */
export function formatTimeUzbek(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} soat ${mins} daqiqa`;
  }
  return `${mins} daqiqa`;
}
