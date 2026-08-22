import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shelf Aware Pro",
  description: "B2B inventory optimization and ordering dashboard.",
};

import { ShaderBackground } from "@/components/ui/manu";
import DateSimulator from "@/components/DateSimulator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-slate-950 text-slate-100 selection:bg-teal-500/30 overflow-hidden relative flex flex-col">
        {/* Global WebGL Shader Canvas Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <ShaderBackground className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/90 backdrop-blur-[1px]" />
        </div>
        
        {/* Header Bar */}
        <div className="relative z-50 w-full flex justify-end px-6 py-4 shrink-0">
          <DateSimulator />
        </div>

        {/* Main Content Layer */}
        <div className="relative z-10 flex-1 w-full min-h-0">
          {children}
        </div>
      </body>
    </html>
  );
}
