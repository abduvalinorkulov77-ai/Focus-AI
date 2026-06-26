import React, { useState } from "react";
import { HabitSuggestion } from "../types";
import { Sparkles, Brain, ArrowRight, Loader2, Plus, AlertCircle, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ICON_MAP } from "../utils";

interface AiCoachProps {
  onAddSuggestedHabit: (suggestion: HabitSuggestion) => void;
}

export default function AiCoach({ onAddSuggestedHabit }: AiCoachProps) {
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userGoal: goalInput }),
      });

      if (!response.ok) {
        throw new Error("AI bilan bog'lanishda xatolik yuz berdi");
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Kechirasiz, AI maslahatlarini olishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setGoalInput(promptText);
  };

  const quickPrompts = [
    "Dasturlash va algoritm o'rganish",
    "Sog'lom hayot tarzi va fitnes",
    "Kitob o'qish va xotirani kuchaytirish",
    "Sokin va tartibli uxlash odati",
  ];

  return (
    <div id="ai-coach-panel" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg mb-8 border border-slate-700/50 relative overflow-hidden">
      {/* Glow decorative effects */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
            Focus AI Coach <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Beta</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            Maqsadingizni yozing va AI sizga moslashtirilgan odatlarni loyihalashtirib beradi
          </p>
        </div>
      </div>

      <form onSubmit={handleSuggest} className="mb-5 relative z-10">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="ai-goal-input"
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Masalan: Men ingliz tili darajamni IELTS 7.5 ga ko'tarmoqchiman..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-100 placeholder-slate-400 text-sm outline-hidden transition-all"
            disabled={loading}
          />
          <button
            id="ai-suggest-btn"
            type="submit"
            disabled={loading || !goalInput.trim()}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI o'ylamoqda...
              </>
            ) : (
              <>
                AI Loyihalash
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Suggestions presets */}
      <div className="mb-5 relative z-10">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Tezkor mavzular:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              id={`quick-prompt-${prompt.replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            id="ai-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 mb-4"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {loading && (
          <motion.div
            id="ai-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center bg-slate-950/30 rounded-xl border border-slate-700/30"
          >
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-3" />
            <span className="text-sm font-semibold text-slate-200">
              Sun'iy intellekt muhandisi odatlarni tahlil qilmoqda...
            </span>
            <span className="text-xs text-slate-400 mt-1 max-w-xs block px-4">
              "Kichik qadamlar buyuk muvaffaqiyatlarga olib boradi." - Har bir odat vaqtini muvozanatlash juda muhim.
            </span>
          </motion.div>
        )}

        {suggestions.length > 0 && !loading && (
          <motion.div
            id="ai-suggestions-list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Siz uchun maxsus AI takliflari:
              </span>
              <button
                id="clear-suggestions"
                type="button"
                onClick={() => setSuggestions([])}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Yashirish
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestions.map((sug, idx) => {
                const IconComponent = ICON_MAP[sug.iconType] || Sparkles;
                return (
                  <motion.div
                    key={idx}
                    id={`sug-${idx}`}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-950/40 border border-slate-700/60 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                          {sug.category}
                        </span>
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 font-display mb-1 truncate">
                        {sug.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {sug.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 mt-auto">
                      <span className="text-xs font-semibold text-teal-300 font-mono">
                        Maqsad: {sug.targetHours} soat
                      </span>
                      <button
                        id={`add-sug-btn-${idx}`}
                        onClick={() => {
                          onAddSuggestedHabit(sug);
                          // Remove from suggestions list once clicked
                          setSuggestions(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:shadow-xs"
                        title="Odatlarimga qo'shish"
                      >
                        <Plus className="w-3 h-3" />
                        Qo'shish
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
