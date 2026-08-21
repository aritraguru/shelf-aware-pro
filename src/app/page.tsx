import { BarChart3, Bot, Box, Users, Truck, Sparkles, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";
import Link from "next/link";
import { ShaderBackground } from "@/components/ui/manu";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500/30">
      {/* 21st.dev WebGL Shader Canvas Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ShaderBackground className="w-full h-full opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/90 backdrop-blur-[1px]" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col justify-center">
        
        {/* Navigation / Top Badge */}
        <header className="mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-sm font-medium mb-6 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Autonomous B2B Restocking & MILP Optimization</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/20">
              <Box className="w-9 h-9 text-slate-950" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
              Shelf Aware <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Pro</span>
            </h1>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-lg md:text-xl text-slate-350 max-w-2xl mx-auto leading-relaxed font-light">
              AI-driven predictive inventory optimization with
            </p>
            <TypewriterEffectSmooth
              words={[
                { text: "proactive", className: "text-teal-400 font-medium" },
                { text: "WhatsApp-style", className: "text-teal-400 font-medium" },
                { text: "conversational", className: "text-cyan-400 font-medium" },
                { text: "ordering.", className: "text-cyan-300 font-semibold" }
              ]}
              className="my-1 justify-center text-center text-sm md:text-lg lg:text-xl"
              cursorClassName="bg-teal-400 h-5 sm:h-6 xl:h-8"
            />
          </div>
        </header>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Internal Sales Rep View */}
          <Link href="/dashboard/1" className="group relative block rounded-3xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl transition-all duration-300 group-hover:border-teal-500/50 group-hover:shadow-2xl group-hover:shadow-teal-500/10" />
            
            <div className="relative p-8 md:p-10 flex flex-col h-full justify-between z-10 min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/40 text-xs text-teal-300 font-medium">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Real-time Telemetry</span>
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-white group-hover:text-teal-300 transition-colors mb-4">
                  Sales Rep View
                </h2>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                  Internal monitoring console to observe upcoming stockouts, verify MILP-driven restock allocations, and track AI bot outreach telemetry.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-teal-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                <span>Enter Sales Rep Console</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: External Distributor View */}
          <Link href="/distributor/1" className="group relative block rounded-3xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-teal-950/70 backdrop-blur-xl border border-slate-700/60 rounded-3xl transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/10" />

            <div className="relative p-8 md:p-10 flex flex-col h-full justify-between z-10 min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Truck className="w-7 h-7" />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/40 text-xs text-cyan-300 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Gemini 3.5 Conversational Loop</span>
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-white group-hover:text-cyan-300 transition-colors mb-4">
                  Distributor View
                </h2>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
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

        {/* System Capabilities Pill Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/60">
            <Cpu className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white">MILP Optimization</h3>
              <p className="text-xs text-slate-400">Automated linear programming restock logic</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/60">
            <Bot className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white">Gemini NLP Loop</h3>
              <p className="text-xs text-slate-400">Natural language order intake and intent classification</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/60">
            <Database className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white">Supabase PostgreSQL</h3>
              <p className="text-xs text-slate-400">Real-time inventory state synchronization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-900/80">
        Shelf Aware Pro V2 • Powered by Next.js, Tailwind CSS & WebGL Shader Builder
      </footer>
    </main>
  );
}
