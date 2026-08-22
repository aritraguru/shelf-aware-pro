import { BarChart3, Bot, Box, Users, Truck, Sparkles, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ShaderBackground } from "@/components/ui/manu";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-transparent text-slate-100 flex flex-col justify-between">
      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-2 flex-1 flex flex-col justify-center min-h-0">
        
        {/* Navigation / Top Badge */}
        <header className="mb-4 text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <Logo className="w-full max-w-[260px] h-auto drop-shadow-2xl" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm mt-1">
              Shelf Aware <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Pro</span>
            </h1>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-base md:text-lg text-slate-350 max-w-2xl mx-auto leading-relaxed font-light">
              AI-driven predictive inventory optimization with
            </p>
            <TypewriterEffectSmooth
              words={[
                { text: "proactive", className: "text-teal-400 font-medium" },
                { text: "WhatsApp-style", className: "text-teal-400 font-medium" },
                { text: "conversational", className: "text-cyan-400 font-medium" },
                { text: "ordering.", className: "text-cyan-300 font-semibold" }
              ]}
              className="my-1 justify-center text-center text-sm md:text-base lg:text-lg"
              cursorClassName="bg-teal-400 h-4 sm:h-5 xl:h-6"
            />
          </div>
        </header>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {/* Card 1: Internal Dashboard View */}
          <Link data-tour="sales-dashboard-link-1" href="/dashboard/1" className="group relative block rounded-3xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-teal-950/70 backdrop-blur-xl border border-slate-700/60 rounded-3xl transition-all duration-300 group-hover:border-teal-400/50 group-hover:shadow-2xl group-hover:shadow-teal-500/10" />

            <div className="relative p-5 md:p-6 flex flex-col h-full justify-between z-10 min-h-[200px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/40 text-xs text-teal-300 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Gemini 1.5 Pro Demand Prediction</span>
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-white group-hover:text-teal-300 transition-colors mb-2">
                  Sales Rep Dashboard
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Internal viewport predicting distributor stockouts before they happen, visualizing order spikes and baseline consumption patterns.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-teal-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                <span>Enter Sales Rep View</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: External Distributor View */}
          <Link data-tour="chat-link-1" href="/distributor/1" className="group relative block rounded-3xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-teal-950/70 backdrop-blur-xl border border-slate-700/60 rounded-3xl transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/10" />

            <div className="relative p-5 md:p-6 flex flex-col h-full justify-between z-10 min-h-[200px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/40 text-xs text-cyan-300 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Gemini 3.5 Conversational Loop</span>
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  Distributor View
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Distributor-first WhatsApp interface where clients receive automated restock triggers and approve, modify, or reject orders seamlessly.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-cyan-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                <span>Launch Distributor Chat</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
