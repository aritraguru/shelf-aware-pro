"use client";

import React from "react";
import { useTour } from "./TourProvider";
import DateSimulator from "./DateSimulator";

import { Volume2, VolumeX } from "lucide-react";

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { hasSeenDemo, showIntro, resetDemo, isMuted, setIsMuted, isActive } = useTour();

  // If the demo intro hasn't been passed, we hide the main app components
  // so that Page 0 genuinely looks like a separate landing page, not an overlay
  if (!hasSeenDemo || showIntro) {
    return null; 
  }

  return (
    <>
      {/* Header Bar */}
      <div className="relative z-50 w-full flex justify-end gap-4 items-center px-6 py-4 shrink-0">
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

      {/* Main Content Layer */}
      <div className="relative z-10 flex-1 w-full min-h-0">
        {children}
      </div>
    </>
  );
}
