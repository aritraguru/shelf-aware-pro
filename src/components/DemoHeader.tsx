"use client";

import React from "react";
import { useTour } from "./TourProvider";
import DateSimulator from "./DateSimulator";
import { Volume2, VolumeX } from "lucide-react";

export default function DemoHeader() {
  const { isMuted, setIsMuted, isActive, resetDemo } = useTour();

  return (
    <div className="w-full flex justify-end gap-4 items-center px-6 py-4 shrink-0">
      <div className="flex gap-4 items-center pointer-events-auto">
        {isActive && (
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold rounded-xl transition-colors border border-slate-700/50 shadow-lg"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}
        <button 
          onClick={resetDemo}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold rounded-xl text-sm transition-colors border border-slate-700/50 shadow-lg"
        >
          Restart Demo
        </button>
        <DateSimulator />
      </div>
    </div>
  );
}
