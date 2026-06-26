export interface Habit {
  id: string;
  title: string;
  targetHours: number;
  secondsSpent: number;
  isActive: boolean;
  completed: boolean;
  category: string;
  iconType: string; // "brain" | "book" | "code" | "run" | "laptop" | "meditation" | "target" | etc.
  imageUrl: string | null; // Drag & drop image or selected image
  colorPreset: string; // Tailwind color class or hex
  lastActiveTime: number | null; // Epoch millisecond timestamp to resume timer across page reloads!
  createdAt: number;
}

export interface HabitSuggestion {
  title: string;
  targetHours: number;
  description: string;
  category: string;
  iconType: string;
}

export interface Quote {
  text: string;
  author: string;
}
