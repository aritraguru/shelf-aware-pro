"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type TourStep = {
  target: string;
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
  actionRequired?: boolean; // If true, requires clicking the element to advance
  waitForEvent?: string; // If set, waits for this custom window event instead of a click
};

export const TOUR_STEPS: TourStep[] = [
  { target: "sales-dashboard-link-1", tooltip: "Welcome! This is the Internal Sales Rep View. Here, managers can monitor stock levels, track real-time telemetry, and verify AI-driven restock forecasts.", position: "bottom", actionRequired: false },
  { target: "chat-link-1", tooltip: "This is the External Distributor View. It simulates the WhatsApp interface where clients receive automated restock triggers and approve orders seamlessly.", position: "bottom", actionRequired: false },
  { target: "sales-dashboard-link-1", tooltip: "Let's dive in. Click here to enter the Sales Rep Dashboard.", position: "bottom", actionRequired: true },
  { target: "sku-chart-0", tooltip: "This graph visualizes the 30-day historical consumption patterns. We are forecasting using ML, and this data is streaming from a live backend connection to predict exactly when the distributor will run out of stock.", position: "bottom", actionRequired: false },
  { target: "forecast-date-0", tooltip: "Notice the 'Next Predicted Order' date. This is the exact date our ML model expects the distributor's inventory to hit zero.", position: "right", actionRequired: false },
  { target: "date-simulator-btn", tooltip: "Let's test the AI! Click 'Skip to {{forecastDate}}' to instantly advance time to the predicted stockout date. Notice how the AI proactively prepares an automated message without needing a manual override.", position: "bottom", actionRequired: false },
  { target: "open-chat-btn", tooltip: "Click this button to jump directly into the Distributor's WhatsApp interface to see the automated message they received.", position: "bottom", actionRequired: true },
  { target: "chat-latest-msg", tooltip: "Because the date hit the predicted stockout, the AI proactively sent this restock proposal automatically.", position: "left", actionRequired: false },
  { target: "lang-dropdown", tooltip: "Try switching the language dropdown at the top to see our Gemini 1.5 Pro live translation in action!", position: "bottom", actionRequired: false },
  { target: "chat-input", tooltip: "Reply 'Yes' to approve the order. The AI will instantly parse your intent and update the central database.", position: "top", actionRequired: true, waitForEvent: "demo_order_placed" },
  { target: "back-to-dashboard-btn", tooltip: "Order approved! Click back to the Sales Dashboard to see the graph naturally spike and the predictive forecast advance into the future. Demo complete!", position: "bottom", actionRequired: true }
];

interface TourContextType {
  isActive: boolean;
  showIntro: boolean;
  currentStepIndex: number;
  hasSeenDemo: boolean;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  startDemo: () => void;
  skipDemo: () => void;
  resetDemo: () => void;
  startTour: () => void;
  nextStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
};

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenDemo, setHasSeenDemo] = useState(true); // Default true until mounted to prevent hydration flash
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("has_seen_demo");
    if (!seen) {
      setHasSeenDemo(false);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isActive && !isMuted) {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive, isMuted]);

  const startDemo = () => {
    setShowIntro(true);
  };

  const skipDemo = () => {
    localStorage.setItem("has_seen_demo", "true");
    setHasSeenDemo(true);
    setIsActive(false);
    setShowIntro(false);
  };

  const resetDemo = () => {
    localStorage.removeItem("has_seen_demo");
    setHasSeenDemo(false);
    setIsActive(false);
    setShowIntro(false);
    setCurrentStepIndex(0);
    // Hard refresh to home page clears state
    window.location.href = "/";
  };

  const startTour = () => {
    localStorage.setItem("has_seen_demo", "true");
    setHasSeenDemo(true);
    setShowIntro(false);
    setIsActive(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
  };

  return (
    <TourContext.Provider value={{
      isActive,
      showIntro,
      currentStepIndex,
      hasSeenDemo,
      isMuted,
      setIsMuted,
      startDemo,
      skipDemo,
      resetDemo,
      startTour,
      nextStep,
      endTour
    }}>
      <audio ref={audioRef} src="/bgsoundtrack.mp3" loop preload="auto" />
      {children}
    </TourContext.Provider>
  );
};
