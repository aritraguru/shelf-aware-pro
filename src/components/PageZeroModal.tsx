"use client";

import React from "react";
import { useTour } from "./TourProvider";
import { Sparkles, ArrowRight, Bot, Target, MessageSquare } from "lucide-react";

export default function PageZeroModal() {
  const { hasSeenDemo, showIntro, startDemo, skipDemo, startTour, isActive } = useTour();

  if (isActive) return null; // Don't show if tour is active
  if (hasSeenDemo && !showIntro) return null; // Already dismissed

  // Intro Popup State
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl max-w-xl w-full p-8 text-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/20 rounded-xl">
              <Bot className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
          </div>
          
          <p className="text-slate-300 leading-relaxed mb-6">
            Shelf Aware Pro bridges the gap between AI-driven inventory forecasting and seamless conversational commerce. Our prediction engine analyzes historical sales to predict exactly when a distributor will run out of stock, and proactively negotiates restock orders via WhatsApp using Gemini-powered local language translation.
          </p>
          
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">In this interactive demo, you will:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Advance time to trigger an automated stockout alert.</span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Review the AI's recommendations in the Sales Rep Dashboard.</span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Dispatch an automated restock proposal.</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Step into the Distributor's shoes to approve the order in their native language.</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
            <button 
              onClick={skipDemo}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={startTour}
              className="px-6 py-2.5 flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
            >
              Start Interactive Tour
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Splash Screen State (Page 0)
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="max-w-md text-center space-y-8 p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-teal-500/20 mb-8">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome to <br/> Shelf Aware Pro
        </h1>
        
        <p className="text-lg text-slate-400">
          Would you like a guided interactive tour of the AI prediction engine?
        </p>
        
        <div className="flex flex-col gap-4 pt-4">
          <button 
            onClick={startDemo}
            className="w-full py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Try Demo!
          </button>
          <button 
            onClick={skipDemo}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-base transition-colors"
          >
            Skip, I know how it works
          </button>
        </div>
      </div>
    </div>
  );
}
