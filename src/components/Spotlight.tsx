"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTour, TOUR_STEPS } from "./TourProvider";
import { Sparkles, X, ChevronRight } from "lucide-react";
import CatTutor from "./CatTutor";

export default function Spotlight() {
  const { isActive, currentStepIndex, nextStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  // Track if we're on the conclusion step
  const isConclusion = isActive && currentStepIndex >= TOUR_STEPS.length;

  useEffect(() => {
    if (!isActive || isConclusion) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    let currentTarget: Element | null = null;
    
    const findTarget = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        currentTarget = el;
      } else {
        setTargetRect(null);
        currentTarget = null;
      }
    };

    findTarget();
    
    // Polling handles async UI rendering or route transitions
    const interval = setInterval(findTarget, 500);
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget, true);

    const handleDocumentClick = (e: MouseEvent) => {
      if (!step.actionRequired || !currentTarget || step.waitForEvent) return;
      if (currentTarget.contains(e.target as Node) || currentTarget === e.target) {
        // Give transition time
        setTimeout(() => {
          nextStep();
        }, 300);
      }
    };
    
    const handleCustomEvent = () => {
      setTimeout(() => {
        nextStep();
      }, 300);
    };
    
    if (step.actionRequired && !step.waitForEvent) {
      document.addEventListener('click', handleDocumentClick, { capture: true });
    }
    
    if (step.waitForEvent) {
      window.addEventListener(step.waitForEvent, handleCustomEvent);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget, true);
      if (step.actionRequired && !step.waitForEvent) {
        document.removeEventListener('click', handleDocumentClick, { capture: true });
      }
      if (step.waitForEvent) {
        window.removeEventListener(step.waitForEvent, handleCustomEvent);
      }
    };


  }, [isActive, currentStepIndex, isConclusion, nextStep]);

  if (!isActive) return null;

  if (isConclusion) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl max-w-md w-full p-8 text-center text-slate-100">
          <div className="w-16 h-16 bg-teal-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">🐱</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Demo Complete!</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            The order has been injected into the timeline. If you return to the Sales Dashboard, you'll see the graph naturally spike and the predictive forecast advance into the future!
          </p>
          <button 
            onClick={endTour}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/20"
          >
            Finish Tour
          </button>
        </div>
      </div>
    );
  }

  const step = TOUR_STEPS[currentStepIndex];

  // Define padding for the spotlight cutout
  const padding = 8;
  const cx = targetRect ? targetRect.left - padding : 0;
  const cy = targetRect ? targetRect.top - padding : 0;
  const cw = targetRect ? targetRect.width + padding * 2 : 0;
  const ch = targetRect ? targetRect.height + padding * 2 : 0;
  
  // Tooltip Positioning
  let tooltipStyle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' };

  if (targetRect) {
    tooltipStyle = { opacity: 1, position: 'fixed', zIndex: 101 };
    const gap = 16;
    const tooltipWidth = 300;
    
    // Default to bottom
    const leftPos = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, cx + (cw / 2) - (tooltipWidth / 2)));
    
    if (step.position === 'bottom' || !step.position) {
      let topPos = cy + ch + gap;
      // Auto-flip to top if it goes off screen (assuming ~250px height max)
      if (topPos > window.innerHeight - 250) {
        tooltipStyle.bottom = window.innerHeight - cy + gap;
      } else {
        tooltipStyle.top = topPos;
      }
      tooltipStyle.left = leftPos;
    } else if (step.position === 'top') {
      let bottomPos = window.innerHeight - cy + gap;
      if (bottomPos > window.innerHeight - 250) {
         tooltipStyle.top = cy + ch + gap;
      } else {
         tooltipStyle.bottom = bottomPos;
      }
      tooltipStyle.left = leftPos;
    } else if (step.position === 'left') {
      tooltipStyle.top = Math.max(16, Math.min(window.innerHeight - 250, cy + ch / 2 - 50));
      tooltipStyle.right = window.innerWidth - cx + gap;
    } else if (step.position === 'right') {
      tooltipStyle.top = Math.max(16, Math.min(window.innerHeight - 250, cy + ch / 2 - 50));
      tooltipStyle.left = Math.min(window.innerWidth - tooltipWidth - 16, cx + cw + gap);
    }
  }

  let dynamicText = step.tooltip;
  if (dynamicText.includes("{{forecastDate}}")) {
    try {
      const forecasts = JSON.parse(localStorage.getItem('forecasts_1') || "[]");
      if (forecasts.length > 0) {
        dynamicText = dynamicText.replace("{{forecastDate}}", forecasts[0].date);
      } else {
        dynamicText = dynamicText.replace("{{forecastDate}}", "the forecasted date");
      }
    } catch {
      dynamicText = dynamicText.replace("{{forecastDate}}", "the forecasted date");
    }
  }

  return (
    <>
      {/* 4 distinct divs to mask everything EXCEPT the target box */}
      {targetRect && (
        <>
          <div className="fixed z-[90] bg-slate-950/80 transition-all duration-300" style={{ top: 0, left: 0, right: 0, height: Math.max(0, cy) }} />
          <div className="fixed z-[90] bg-slate-950/80 transition-all duration-300" style={{ top: Math.max(0, cy + ch), bottom: 0, left: 0, right: 0 }} />
          <div className="fixed z-[90] bg-slate-950/80 transition-all duration-300" style={{ top: Math.max(0, cy), height: Math.max(0, ch), left: 0, width: Math.max(0, cx) }} />
          <div className="fixed z-[90] bg-slate-950/80 transition-all duration-300" style={{ top: Math.max(0, cy), height: Math.max(0, ch), right: 0, left: Math.max(0, cx + cw) }} />
        </>
      )}

      {/* Full screen shadow if no target found yet, to prevent interacting */}
      {!targetRect && (
        <div className="fixed inset-0 z-[90] bg-slate-950/80 transition-all duration-300" />
      )}
      {/* Tooltip Wrapper */}
      {targetRect && (
        <div 
          style={tooltipStyle}
          className="transition-all duration-300 ease-out z-[110] relative flex items-end"
        >
          {/* Animated Sprite */}
          <div className={`absolute bottom-0 h-full w-[120px] pointer-events-none z-20 ${
             (tooltipStyle.left as number) > window.innerWidth / 2 ? '-left-[100px]' : '-right-[100px]'
          }`}>
             <CatTutor 
                state={['Idle', 'Walk', 'Run', 'Slide', 'Jump'][currentStepIndex % 5] as any} 
                fps={8} 
                flip={(tooltipStyle.left as number) <= window.innerWidth / 2}
                className="w-full h-full" 
             />
          </div>

          {/* Tooltip Box */}
          <div className="w-[300px] bg-slate-800 border border-teal-500/50 shadow-2xl shadow-teal-900/20 p-5 rounded-2xl text-slate-100 relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-teal-500 flex items-center justify-center shrink-0 shadow-md">
                <span className="text-xl">🐱</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 mt-1">Tutor Cat • Step {currentStepIndex + 1}/{TOUR_STEPS.length}</span>
                  <button onClick={endTour} className="text-slate-400 hover:text-white mt-0.5"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-slate-200">{dynamicText}</p>
          
          <div className="flex justify-between items-center mt-4">
            {step.actionRequired ? (
              <span className="text-xs font-medium text-amber-400 animate-pulse">
                {step.waitForEvent ? "Awaiting your action..." : "Click highlighted area..."}
              </span>
            ) : (
              <button 
                onClick={nextStep}
                className="text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white px-3 py-1.5 rounded-lg ml-auto flex items-center gap-1 transition-colors"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        </div>
      )}
    </>
  );
}
