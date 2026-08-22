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

import { TourProvider } from "@/components/TourProvider";
import PageZeroModal from "@/components/PageZeroModal";
import Spotlight from "@/components/Spotlight";
import MainContentWrapper from "@/components/MainContentWrapper";

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
        <TourProvider>
          <PageZeroModal />
          <Spotlight />
          
          {/* Global WebGL Shader Canvas Background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <ShaderBackground className="w-full h-full opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/90 backdrop-blur-[1px]" />
          </div>
          
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
        </TourProvider>
      </body>
    </html>
  );
}
