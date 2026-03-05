"use client";

import React from "react";
import { PropsWithChildren } from "react";
import Link from "next/link";
import Image from "next/image";

// Split the layout into two small components inside the same file
// to keep component-level separation without moving files.
function LeftPanel() {
  return (
    <aside className="hidden md:flex flex-col justify-between p-10 lg:p-14 bg-linear-to-br from-[#07130b] via-[#072812] to-[#0b2e18] text-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] mix-blend-screen opacity-20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-700 rounded-full blur-[100px] mix-blend-screen opacity-20 -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Image src="/finova-with-text.svg" alt="Finova Logo" width={100} height={100} />
        </div>

        {/* Heading */}
        <div className="mt-10 shrink-0 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight mb-4 text-white">
            Mastering your <br />
            <span className="text-emerald-400">Financial Intelligence</span>
          </h1>
          <p className="text-white/70 text-[17px] leading-relaxed max-w-lg">
            The ultimate financial command center. Seamlessly manage assets, track real-time analytics, and scale your wealth with precision.
          </p>
        </div>

        {/* Dashboard Image — overlaps into stats area */}
        <div className="relative flex-1 mt-8 min-h-0">
          <div className="absolute inset-0 bottom-[-60px] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10">
            <Image
              src="/assets/images/dashboard.png"
              alt="Finova Financial Dashboard"
              width={1200}
              height={800}
              priority
              quality={100}
              className="w-full h-full object-cover object-top-left"
            />
            {/* Bottom fade so stats show through */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#072812] to-transparent" />
          </div>
        </div>

        {/* Stats Footer — sits on top of the overflowing image */}
        <div className="relative z-10 flex gap-12 items-center justify-start shrink-0 pt-4 pb-1 border-t border-white/10 mt-auto">
          <div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1">Orgs</div>
          </div>
          <div>
            <div className="text-2xl font-bold">50k</div>
            <div className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1">Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1">Uptime SLA</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function RightPanel({ children }: PropsWithChildren) {
  return (
    <main className="flex-1 flex flex-col h-full bg-[#f8fafc]/50 overflow-hidden relative">
      {/* Top Header Link */}
      <div className="absolute top-0 right-0 p-6 z-20">
        <Link
          href="#"
          className="text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
        >
          Help & Support
          <span className="text-sm font-normal ml-0.5">↗</span>
        </Link>
      </div>

      {/* Outer container to force center and scroll if strictly needed on tiny height screens, but normally fits in 1 screen */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 h-full overflow-y-auto w-full">
        <div className="w-full max-w-[420px] mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white p-7 sm:p-9 rounded-[2.5rem] border border-gray-100/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] ring-1 ring-black/2">
            {children}
          </div>

          <div className="mt-8 text-center text-[10px] text-white font-bold uppercase tracking-[0.25em] opacity-70">
            © {new Date().getFullYear()} Finova SaaS • Secure Platform
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-green-950 overflow-hidden">
      <LeftPanel />
      <RightPanel>{children}</RightPanel>
    </div>
  );
}
