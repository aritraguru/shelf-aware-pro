"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useTour } from "./TourProvider";

export default function DateSimulator() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [baseDate, setBaseDate] = useState<Date | null>(null);
  const { isActive } = useTour();

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setBaseDate(now);
  }, []);

  const handleNextDay = () => {
    if (!currentDate) return;
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleReset = () => {
    if (!baseDate) return;
    setCurrentDate(baseDate);
    const formatted = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    localStorage.setItem('global_simulated_date', formatted);
    window.dispatchEvent(new CustomEvent('reset_simulation'));
    
    // Globally clear all distributor chat history and alerts from localStorage
    for (let i = 1; i <= 10; i++) {
      localStorage.removeItem(`chat_messages_${i}`);
      localStorage.removeItem(`alerts_sent_${i}`);
    }
  };

  useEffect(() => {
    if (!currentDate) return;
    const formatted = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    localStorage.setItem('global_simulated_date', formatted);
    window.dispatchEvent(new CustomEvent('simulated_date_changed', { detail: { date: formatted } }));
  }, [currentDate]);

  const [forecastDateStr, setForecastDateStr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const forecasts = JSON.parse(localStorage.getItem('forecasts_1') || "[]");
      if (forecasts.length > 0) {
        setForecastDateStr(forecasts[0].date);
      }
    } catch {}
    
    // Listen for storage changes in case dashboard updates it
    const handleStorage = () => {
      try {
        const forecasts = JSON.parse(localStorage.getItem('forecasts_1') || "[]");
        if (forecasts.length > 0) {
          setForecastDateStr(forecasts[0].date);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleFastForward = () => {
    if (!forecastDateStr) return;
    const dateObj = new Date(forecastDateStr);
    if (!isNaN(dateObj.getTime())) {
      setCurrentDate(dateObj);
    }
  };

  if (!currentDate) return null;

  return (
    <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/50 shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-xl text-teal-400">
        <Calendar className="w-5 h-5" />
        <span className="text-base font-semibold whitespace-nowrap">Simulated Date:</span>
        <span className="text-base text-slate-100 min-w-[110px] text-center font-mono tracking-tight">
          {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <div className="flex gap-2">
        {isActive && forecastDateStr && (
          <button data-tour="date-simulator-btn" onClick={handleFastForward} className="px-4 py-2 flex items-center justify-center bg-teal-600/20 border border-teal-500/50 hover:bg-teal-600/40 text-teal-300 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap">
            Skip to {forecastDateStr}
          </button>
        )}
        <button onClick={handleReset} className="px-4 py-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors">Reset</button>
        <button onClick={handleNextDay} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xl transition-colors">+</button>
      </div>
    </div>
  );
}
