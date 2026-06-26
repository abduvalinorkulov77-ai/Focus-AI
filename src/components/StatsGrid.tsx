import { Habit } from "../types";
import { 
  Plus, 
  Target, 
  Flame, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { motion } from "motion/react";

interface StatsGridProps {
  habits: Habit[];
}

export default function StatsGrid({ habits }: StatsGridProps) {
  const totalHabits = habits.length;
  const activeNow = habits.filter((h) => h.isActive).length;
  const completedCount = habits.filter((h) => h.completed).length;
  const totalTargetHours = habits.reduce((sum, h) => sum + h.targetHours, 0);

  const stats = [
    {
      id: "stat-total",
      title: "Jami odatlar",
      value: totalHabits,
      sub: "Kuzatilayotgan barcha maqsadlar",
      icon: Target,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      id: "stat-active",
      title: "Hozir faol",
      value: activeNow,
      sub: "Vaqt ketayotgan odatlar",
      icon: Flame,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      pulse: activeNow > 0,
    },
    {
      id: "stat-completed",
      title: "Bajarilgan",
      value: completedCount,
      sub: "100% ga erishilganlar",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "stat-hours",
      title: "Umumiy maqsad",
      value: `${totalTargetHours} soat`,
      sub: "Rejalashtirilgan umumiy vaqt",
      icon: Clock,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ];

  return (
    <div id="stats-grid-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            id={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-xs relative overflow-hidden"
          >
            {/* Background absolute decorative glow */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3.5 rounded-xl border ${stat.color} relative`}>
                <Icon className="w-5 h-5" />
                {stat.pulse && (
                  <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-slate-800 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  {stat.title}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
