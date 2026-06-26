import React, { useState, useRef } from "react";
import { ICON_MAP, COLOR_PRESETS, STATIC_IMAGES } from "../utils";
import { X, Sparkles, Upload, HelpCircle, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habitData: {
    title: string;
    targetHours: number;
    category: string;
    iconType: string;
    colorPreset: string;
    imageUrl: string | null;
  }) => void;
}

export default function NewHabitModal({ isOpen, onClose, onAddHabit }: NewHabitModalProps) {
  const [title, setTitle] = useState("");
  const [targetHours, setTargetHours] = useState(10);
  const [category, setCategory] = useState("Unumdorlik");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("brain");
  const [selectedColor, setSelectedColor] = useState("Teal");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const categoriesPreset = ["Unumdorlik", "Salomatlik", "Ta'lim", "Texnologiya", "Moliya", "Kreativlik"];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title: title.trim(),
      targetHours: Number(targetHours) || 1,
      category: category === "Custom" ? (customCategory.trim() || "Boshqa") : category,
      iconType: selectedIcon,
      colorPreset: selectedColor,
      imageUrl: selectedImage,
    });

    // Reset fields
    setTitle("");
    setTargetHours(10);
    setCategory("Unumdorlik");
    setCustomCategory("");
    setSelectedIcon("brain");
    setSelectedColor("Teal");
    setSelectedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        id="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        id="modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header Section */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-800">
                Yangi Odat Yaratish
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Vaqtingizni unumli va maqsadiy sarflang
              </p>
            </div>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Title */}
          <div>
            <label htmlFor="habit-title" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Odat nomi:
            </label>
            <input
              id="habit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Figma darslarini o'rganish..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-800 text-sm outline-hidden transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Goal Hours & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="habit-hours" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                ⏱️ Maqsad soati:
              </label>
              <input
                id="habit-hours"
                type="number"
                min="1"
                max="9999"
                required
                value={targetHours}
                onChange={(e) => setTargetHours(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-800 text-sm font-mono outline-hidden transition-all"
              />
            </div>

            <div>
              <label htmlFor="habit-category" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Toifa (Kategoriya):
              </label>
              <select
                id="habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-800 text-sm outline-hidden transition-all cursor-pointer font-medium bg-white"
              >
                {categoriesPreset.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">Custom (Boshqa...)</option>
              </select>
            </div>
          </div>

          {category === "Custom" && (
            <motion.div
              id="custom-category-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-1"
            >
              <label htmlFor="custom-category" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Maxsus toifa nomi:
              </label>
              <input
                id="custom-category"
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Yangi toifani kiriting..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-800 text-sm outline-hidden transition-all font-medium"
              />
            </motion.div>
          )}

          {/* Color Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Rang dizayni:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  id={`color-preset-${color.name}`}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    selectedColor === color.name
                      ? `${color.bg} ${color.border} ${color.text} ring-2 ring-slate-400/20`
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${color.progress}`} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Birlamchi rasm belgisi (Icon):
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(ICON_MAP).map((iconName) => {
                const IconComponent = ICON_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    id={`icon-preset-${iconName}`}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      selectedIcon === iconName
                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload Drag and Drop & Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>🖼️ Odat rasmi (Drag & Drop yoki tanlash):</span>
              {selectedImage && (
                <button
                  id="remove-image-btn"
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                >
                  Rasmni o'chirish
                </button>
              )}
            </label>

            <div className="space-y-3">
              {/* Preset illustrations */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {STATIC_IMAGES.map((imgUrl, i) => (
                  <button
                    key={i}
                    id={`img-preset-${i}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 relative transition-all cursor-pointer ${
                      selectedImage === imgUrl ? "border-teal-500 scale-95" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Drag and Drop Zone */}
              <div
                id="image-drop-zone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 text-center ${
                  dragOver
                    ? "border-teal-500 bg-teal-50/30"
                    : "border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  id="modal-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="flex items-center gap-3 w-full px-2">
                    <img
                      src={selectedImage}
                      alt="Selected preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        Custom Rasm Yuklandi
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Dizaynga qo'shilishga tayyor
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Rasm faylini shu yerga tashlang
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        Yoki qurilmangizdan yuklash uchun bosing
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
            <button
              id="cancel-submit-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              id="submit-new-habit-btn"
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md"
            >
              Odatni Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
