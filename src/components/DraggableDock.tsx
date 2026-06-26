import React from "react";
import { ICON_MAP } from "../utils";
import { HelpCircle, Move } from "lucide-react";
import { motion } from "motion/react";

export default function DraggableDock() {
  const iconList = [
    { type: "brain", label: "Miya charxi" },
    { type: "book", label: "Kitobxonlik" },
    { type: "code", label: "Dasturlash" },
    { type: "run", label: "Sport" },
    { type: "laptop", label: "Ish/Karyera" },
    { type: "meditation", label: "Meditatsiya" },
    { type: "target", label: "Maqsad" },
    { type: "coffee", label: "Tanaffus" },
    { type: "music", label: "Musiqa" },
    { type: "flame", label: "G'ayrat" },
    { type: "activity", label: "Harakat" },
    { type: "heart", label: "Sog'lik" },
  ];

  const handleDragStart = (e: React.DragEvent, iconType: string) => {
    e.dataTransfer.setData("text/plain", iconType);
    e.dataTransfer.setData("dragType", "icon");
    // Change drag preview style if supported
    e.dataTransfer.effectAllowed = "copyMove";
  };

  return (
    <div id="icon-dock" className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Move className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 font-display">
            Interaktiv belgi almashtirgich (Drag & Drop)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50/50 px-2.5 py-1 rounded-full font-medium">
          <HelpCircle className="w-3 h-3" />
          Belgini odat kartasiga sudrab tashlang!
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {iconList.map((iconItem) => {
          const IconComponent = ICON_MAP[iconItem.type];
          return (
            <motion.div
              key={iconItem.type}
              id={`drag-icon-${iconItem.type}`}
              draggable
              onDragStart={(e) => handleDragStart(e, iconItem.type)}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100/80 hover:border-teal-200 hover:bg-teal-50/20 transition-all duration-200 w-20 text-center relative"
              title="Sudrab tashlang!"
            >
              <div className="p-2 rounded-lg bg-white shadow-xs group-hover:bg-white text-slate-600 group-hover:text-teal-600 transition-colors">
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1.5 block truncate w-full">
                {iconItem.label}
              </span>

              {/* Little absolute drag handles */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-[2px]">
                <span className="w-[2px] h-[2px] bg-slate-300 rounded-full"></span>
                <span className="w-[2px] h-[2px] bg-slate-300 rounded-full"></span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
