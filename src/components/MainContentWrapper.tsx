"use client";

import React from "react";
import { useTour } from "./TourProvider";

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { hasSeenDemo, showIntro, resetDemo, isMuted, setIsMuted, isActive } = useTour();

  // If the demo intro hasn't been passed, we hide the main app components
  // so that Page 0 genuinely looks like a separate landing page, not an overlay
  if (!hasSeenDemo || showIntro) {
    return null; 
  }

  return (
    <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col">
      {children}
    </div>
  );
}
