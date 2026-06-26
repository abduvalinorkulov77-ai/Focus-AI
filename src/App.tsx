import { useState, useEffect } from "react";
import { Habit, HabitSuggestion } from "./types";
import { COLOR_PRESETS } from "./utils";
import StatsGrid from "./components/StatsGrid";
import DraggableDock from "./components/DraggableDock";
import AiCoach from "./components/AiCoach";
import HabitCard from "./components/HabitCard";
import NewHabitModal from "./components/NewHabitModal";
import ConfettiEffect from "./components/ConfettiEffect";
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Completed">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Celebration state
  const [celebrateActive, setCelebrateActive] = useState(false);
  const [celebratedHabitTitle, setCelebratedHabitTitle] = useState("");

  // 1. Initial Load and Timer Recovery
  useEffect(() => {
    const saved = localStorage.getItem("focus_ai_habits");
    if (saved) {
      try {
        let loaded = JSON.parse(saved) as Habit[];
        // Recover missed seconds for running timers
        loaded = loaded.map((habit) => {
          if (habit.isActive && habit.lastActiveTime) {
            const elapsedSeconds = Math.floor((Date.now() - habit.lastActiveTime) / 1000);
            if (elapsedSeconds > 0) {
              const targetSeconds = habit.targetHours * 3600;
              const newSeconds = habit.secondsSpent + elapsedSeconds;
              return {
                ...habit,
                secondsSpent: Math.min(targetSeconds, newSeconds),
                completed: newSeconds >= targetSeconds ? true : habit.completed,
                // If it became completed, make sure it pauses
                isActive: newSeconds >= targetSeconds ? false : habit.isActive,
                lastActiveTime: Date.now(),
              };
            }
          }
          return habit;
        });
        setHabits(loaded);
      } catch (err) {
        console.error("Local storage load error:", err);
      }
    } else {
      // Setup the exact default habits from the user's screenshot
      const defaultHabits: Habit[] = [
        {
          id: "habit-1",
          title: "N8N da chuqur amaliyot qilish",
          targetHours: 10,
          secondsSpent: 0,
          isActive: false,
          completed: false,
          category: "Texnologiya",
          iconType: "code",
          imageUrl: null,
          colorPreset: "Crimson",
          lastActiveTime: null,
          createdAt: Date.now() - 100000,
        },
        {
          id: "habit-2",
          title: "Claude AI da chuqur amaliyot qilish",
          targetHours: 10,
          secondsSpent: 0,
          isActive: false,
          completed: false,
          category: "Texnologiya",
          iconType: "laptop",
          imageUrl: null,
          colorPreset: "Teal",
          lastActiveTime: null,
          createdAt: Date.now() - 50000,
        }
      ];
      setHabits(defaultHabits);
      localStorage.setItem("focus_ai_habits", JSON.stringify(defaultHabits));
    }
  }, []);

  // 2. Main Timer Interval Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setHabits((prevHabits) => {
        let changed = false;
        const updated = prevHabits.map((habit) => {
          if (habit.isActive) {
            const newSeconds = habit.secondsSpent + 1;
            const targetSeconds = habit.targetHours * 3600;
            const isCompletedNow = newSeconds >= targetSeconds;

            let completed = habit.completed;
            let isActive = habit.isActive;

            if (isCompletedNow && !habit.completed) {
              completed = true;
              isActive = false; // Stop timer on completion
              setCelebratedHabitTitle(habit.title);
              setCelebrateActive(true);
            }

            changed = true;
            return {
              ...habit,
              secondsSpent: newSeconds,
              completed,
              isActive,
              lastActiveTime: Date.now(),
            };
          }
          return habit;
        });

        if (changed) {
          localStorage.setItem("focus_ai_habits", JSON.stringify(updated));
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save changes helper
  const saveHabits = (updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem("focus_ai_habits", JSON.stringify(updated));
  };

  // --- Handlers ---

  // Add a newly configured habit
  const handleAddHabit = (habitData: {
    title: string;
    targetHours: number;
    category: string;
    iconType: string;
    colorPreset: string;
    imageUrl: string | null;
  }) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      ...habitData,
      secondsSpent: 0,
      isActive: false,
      completed: false,
      lastActiveTime: null,
      createdAt: Date.now(),
    };
    saveHabits([newHabit, ...habits]);
  };

  // Add suggested habit from AI Coach
  const handleAddSuggestedHabit = (suggestion: HabitSuggestion) => {
    // Pick a random beautiful color preset
    const colors = ["Teal", "Crimson", "Amber", "Indigo", "Emerald", "Purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: suggestion.title,
      targetHours: suggestion.targetHours,
      category: suggestion.category,
      iconType: suggestion.iconType,
      colorPreset: randomColor,
      imageUrl: null,
      secondsSpent: 0,
      isActive: false,
      completed: false,
      lastActiveTime: null,
      createdAt: Date.now(),
    };
    saveHabits([newHabit, ...habits]);
  };

  // Toggle Play/Pause on a habit
  const handleToggleActive = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const nowActive = !h.isActive;
        return {
          ...h,
          isActive: nowActive,
          lastActiveTime: nowActive ? Date.now() : null,
        };
      }
      // Pause all other active habits if desired, or keep multiple running.
      // Let's keep multiple running in parallel to maximize time management!
      return h;
    });
    saveHabits(updated);
  };

  // Delete a habit
  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    saveHabits(updated);
  };

  // Drag & drop update icon
  const handleUpdateIcon = (id: string, iconType: string) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, iconType } : h));
    saveHabits(updated);
  };

  // Drag & drop upload custom image
  const handleUpdateImage = (id: string, imageUrl: string) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, imageUrl } : h));
    saveHabits(updated);
  };

  // Reset all habits to screenshot default
  const handleResetData = () => {
    if (confirm("Haqiqatan ham barcha ma'lumotlarni tozalab, boshlang'ich holatga qaytarmoqchimisiz?")) {
      localStorage.removeItem("focus_ai_habits");
      window.location.reload();
    }
  };

  // --- Filtering & Searching logic ---
  const uniqueCategories = Array.from(new Set(habits.map((h) => h.category)));

  const filteredHabits = habits.filter((habit) => {
    // 1. Search Query filter
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          habit.category.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Active / Completed status tab filter
    let matchesStatus = true;
    if (activeFilter === "Active") {
      matchesStatus = habit.isActive;
    } else if (activeFilter === "Completed") {
      matchesStatus = habit.completed;
    }

    // 3. Category selector filter
    const matchesCategory = selectedCategory === "All" || habit.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden bg-grid-dots">
      {/* Visual background gradient blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-rose-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Confetti Celebration Particle Canvas */}
      <ConfettiEffect
        active={celebrateActive}
        onComplete={() => setCelebrateActive(false)}
      />

      {/* Celebration Notification Popup */}
      <AnimatePresence>
        {celebrateActive && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl border border-teal-500/30 flex items-center gap-3 max-w-md w-[90vw]"
          >
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
              <CheckCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold font-display text-white">
                Tabriklaymiz! 🎉
              </h4>
              <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-2">
                Siz "{celebratedHabitTitle}" odatingiz maqsadiga to'liq erishdingiz!
              </p>
            </div>
            <button
              id="dismiss-celebrate"
              onClick={() => setCelebrateActive(false)}
              className="text-xs text-teal-400 hover:text-teal-300 ml-auto font-bold cursor-pointer"
            >
              Yopish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-ping" />
              <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest font-display">
                Muvaffaqiyat kaliti
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 font-display flex items-center gap-2.5">
              Focus <span className="text-teal-600">AI</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Vaqtga asoslangan odatlar kuzatuvchisi — har bir soat maqsad sari qadam
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="reset-all-data-btn"
              onClick={handleResetData}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Barcha ma'lumotlarni tozalash"
            >
              <RotateCcw className="w-4 h-4" />
              Tizimni qayta yuklash
            </button>

            <button
              id="open-create-modal-btn"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-teal-600/10 active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" />
              Yangi odat
            </button>
          </div>
        </div>

        {/* Statistics Dashboard Cards */}
        <StatsGrid habits={habits} />

        {/* AI Intelligent Coach Drawer */}
        <AiCoach onAddSuggestedHabit={handleAddSuggestedHabit} />

        {/* Interactive Drag & Drop icon warehouse dock */}
        <DraggableDock />

        {/* Control and Filter Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl w-full md:w-auto">
            <button
              id="filter-all"
              onClick={() => setActiveFilter("All")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "All"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Barchasi
            </button>
            <button
              id="filter-active"
              onClick={() => setActiveFilter("Active")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "Active"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Faol
            </button>
            <button
              id="filter-completed"
              onClick={() => setActiveFilter("Completed")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "Completed"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Bajarilgan
            </button>
          </div>

          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Category Select Filter */}
            <div className="relative w-full sm:w-44">
              <select
                id="category-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-hidden appearance-none cursor-pointer"
              >
                <option value="All">Barcha toifalar</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                id="search-habits-input"
                type="text"
                placeholder="Odatlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 text-xs font-medium outline-hidden focus:border-teal-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Habits Grid Container */}
        <AnimatePresence mode="popLayout">
          {filteredHabits.length > 0 ? (
            <motion.div
              id="habits-grid"
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteHabit}
                  onUpdateIcon={handleUpdateIcon}
                  onUpdateImage={handleUpdateImage}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              id="no-habits-fallback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center bg-white border border-slate-100 rounded-3xl p-8 shadow-xs max-w-md mx-auto"
            >
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 font-display">
                Odatlar topilmadi
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed font-medium">
                Siz tanlagan filtrlar bo'yicha hech qanday odat topilmadi. AI yordamida yangi odat loyihalang yoki yangi odat qo'shing!
              </p>
              <button
                id="clear-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                  setSelectedCategory("All");
                }}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-3 underline cursor-pointer"
              >
                Filtrlarni tozalash
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info text */}
        <div id="app-footer" className="text-center mt-16 pb-6 text-[11px] text-slate-400 font-medium">
          <p className="flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
            Diqqat — muvaffaqiyat kaliti. Har kuni ozgina, lekin doimiy.
          </p>
          <p className="mt-1 opacity-70">
            Focus AI &copy; 2026. Barcha huquqlar himoyalangan.
          </p>
        </div>

        {/* Habit Creation Modal Portal */}
        <AnimatePresence>
          <NewHabitModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddHabit={handleAddHabit}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
