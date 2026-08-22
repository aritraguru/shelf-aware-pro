"use client";

import React, { useState, useEffect } from 'react';

type AnimationState = 'Idle' | 'Walk' | 'Run' | 'Jump' | 'Fall' | 'Slide';

const ANIMATION_FRAMES: Record<AnimationState, number> = {
  Idle: 4,
  Walk: 10,
  Run: 8,
  Jump: 8,
  Fall: 3,
  Slide: 10
};

interface CatTutorProps {
  state?: AnimationState;
  fps?: number;
  className?: string;
  flip?: boolean;
}

export default function CatTutor({ state = 'Idle', fps = 8, className = "", flip = false }: CatTutorProps) {
  const [frame, setFrame] = useState(1);
  const maxFrames = ANIMATION_FRAMES[state] || 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev % maxFrames) + 1);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [state, maxFrames, fps]);

  // Preload next frames to prevent flickering
  useEffect(() => {
    for (let i = 1; i <= maxFrames; i++) {
      const img = new Image();
      img.src = `/cat/${state} (${i}).png`;
    }
  }, [state, maxFrames]);

  // Reset frame when state changes
  useEffect(() => {
    setFrame(1);
  }, [state]);

  return (
    <div className={`relative flex items-end justify-center overflow-hidden ${className}`}>
      <img 
        src={`/cat/${state} (${frame}).png`} 
        alt="Tutor Cat"
        className={`w-[150%] h-[150%] object-contain drop-shadow-md ${flip ? 'scale-x-[-1]' : ''}`} 
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
