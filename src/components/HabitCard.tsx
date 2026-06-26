import React, { useState } from "react";
import { Habit } from "../types";
import { ICON_MAP, COLOR_PRESETS, formatTime } from "../utils";
import { 
  Play, 
  Pause, 
  Trash2, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  FileImage, 
  Loader2, 
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HabitCardProps {
  key?: string;
  habit: Habit;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateIcon: (id: string, iconType: string) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
}

export default function HabitCard({
  habit,
  onToggleActive,
  onDelete,
  onUpdateIcon,
  onUpdateImage,
}: HabitCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const IconComponent = ICON_MAP[habit.iconType] || Clock;
  const colorPreset = COLOR_PRESETS.find((c) => c.name === habit.colorPreset) || COLOR_PRESETS[0];

  // Target hours converted to seconds
  const targetSeconds = habit.targetHours * 3600;
  const progressPercent = Math.min(100, parseFloat(((habit.secondsSpent / targetSeconds) * 100).toFixed(2)));
  const secondsRemaining = Math.max(0, targetSeconds - habit.secondsSpent);

  // Formatting remaining time as HH:MM:SS
  const remainingTimeStr = formatTime(secondsRemaining);
  const spentTimeStr = formatTime(habit.secondsSpent);

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    // 1. Icon drag from dock
    const dragType = e.dataTransfer.getData("dragType");
    const iconType = e.dataTransfer.getData("text/plain");

    if (dragType === "icon" && iconType) {
      onUpdateIcon(habit.id, iconType);
      return;
    }

    // 2. Local image file drag
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateImage(habit.id, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get dynamic AI inspiration
  const handleAiMotivate = async () => {
    if (loadingAi) return;
    setLoadingAi(true);
    setMotivation(null);
    try {
      const res = await fetch("/api/gemini/motivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitTitle: habit.title,
          progressPercent: progressPercent,
          targetHours: habit.targetHours,
          timeSpentFormatted: spentTimeStr,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setMotivation(data.motivation);
    } catch (err) {
      setMotivation("Har kuni ozgina harakat, katta g'alabalarga poydevor bo'ladi. Davom eting!");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <motion.div
      id={`habit-card-${habit.id}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-6 rounded-3xl bg-white border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        dragOver 
          ? "border-teal-500 shadow-md scale-[1.01] bg-teal-50/10" 
          : "border-slate-100 shadow-xs hover:border-slate-200"
      }`}
    >
      {/* Background visual watermarks */}
      {habit.completed && (
        <div className="absolute right-3 top-3 text-emerald-500 opacity-10 pointer-events-none">
          <CheckCircle className="w-40 h-40" />
        </div>
      )}

      {/* Drag & Drop Overlay Indicator */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            id={`drag-overlay-${habit.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-teal-500/5 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white/95 px-4 py-2.5 rounded-2xl shadow-lg border border-teal-200 text-teal-700 text-xs font-bold flex items-center gap-2">
              <FileImage className="w-4 h-4 animate-bounce" />
              Rasm yoki Belgini shu yerga tashlang!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Top bar with Icon / Category / Title */}
        <div className="flex items-start gap-4 mb-5">
          {/* Circular Icon Container */}
          <div 
            id={`icon-container-${habit.id}`}
            className="relative shrink-0 group/icon cursor-pointer"
            title="Dizaynni o'zgartirish uchun belgi sudrab tashlang yoki rasm tashlang"
          >
            {habit.imageUrl ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 relative">
                <img 
                  src={habit.imageUrl} 
                  alt={habit.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/icon:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                  Edit
                </div>
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center relative transition-colors ${colorPreset.bg} ${colorPreset.border} ${colorPreset.text}`}>
                <IconComponent className="w-6 h-6" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/icon:opacity-100 transition-opacity rounded-2xl" />
              </div>
            )}
            
            {/* Overlay badge for completed habit */}
            {habit.completed && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />
              </span>
            )}
          </div>

          {/* Title and Category */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {habit.category}
              </span>
              {habit.isActive && (
                <span className="text-[10px] bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  Faol
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight font-display line-clamp-2" title={habit.title}>
              {habit.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Maqsad: {habit.targetHours} soat
            </p>
          </div>
        </div>

        {/* Digital Clock Section */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                O'tgan vaqt (HH:MM:SS)
              </span>
              <span className="text-2xl font-bold font-mono text-slate-800 tracking-tight text-digital block mt-0.5">
                {spentTimeStr}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 font-display block">
                {progressPercent}%
              </span>
              <span className="text-[10px] text-emerald-500 font-bold tracking-tight block">
                bajarildi
              </span>
            </div>
          </div>

          {/* Minimal progress bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${habit.completed ? "bg-emerald-500" : colorPreset.progress}`}
            />
          </div>

          <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-medium">
            <span>Jarayon paneli</span>
            <span>Qolgan: <strong className="font-mono text-slate-600">{remainingTimeStr}</strong></span>
          </div>
        </div>
      </div>

      {/* AI motivation quote area */}
      <AnimatePresence>
        {motivation && (
          <motion.div
            id={`ai-quote-${habit.id}`}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="p-3 bg-teal-500/5 border border-teal-500/15 rounded-xl text-teal-800 text-[11px] leading-relaxed mb-4 relative"
          >
            <div className="absolute right-2 top-2 text-teal-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="font-medium pr-4">
              ✨ <strong>AI Motivator:</strong> {motivation}
            </p>
            <button
              id={`close-ai-quote-${habit.id}`}
              onClick={() => setMotivation(null)}
              className="text-[9px] text-teal-600 font-semibold underline mt-1 block hover:text-teal-700 cursor-pointer"
            >
              Yopish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Actions (Boshlash, Delete, AI helper) */}
      <div className="flex items-center gap-2 mt-auto">
        {habit.completed ? (
          <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5" />
            Maqsad Bajarildi!
          </div>
        ) : (
          <button
            id={`toggle-timer-${habit.id}`}
            onClick={() => onToggleActive(habit.id)}
            className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
              habit.isActive 
                ? "bg-rose-500 hover:bg-rose-600" 
                : `${colorPreset.btn}`
            }`}
          >
            {habit.isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white text-white" />
                To'xtatish
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                Boshlash
              </>
            )}
          </button>
        )}

        {/* AI motivation button */}
        <button
          id={`ai-motivate-btn-${habit.id}`}
          onClick={handleAiMotivate}
          disabled={loadingAi}
          className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/20 transition-all cursor-pointer"
          title="AI dan tezkor motivatsiya olish"
        >
          {loadingAi ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-teal-500" />
          )}
        </button>

        {/* Delete Habit */}
        <button
          id={`delete-habit-btn-${habit.id}`}
          onClick={() => onDelete(habit.id)}
          className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/20 transition-all cursor-pointer"
          title="Odatni o'chirish"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
