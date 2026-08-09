import React from 'react';
import Navbar from '../components/navbar';
import { AmbientBackground } from '../components/AmbientBackground';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D10A8A] selection:text-white flex flex-col">
      {/* Dynamic Animated Ambient Background Glows */}
      <AmbientBackground />

      {/* Unified Navbar with Clerk Auth & Logout State */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-12 py-8 space-y-8">
        {children}
      </main>

      {/* Unified Glass Footer */}
      <footer className="w-full border-t border-white/10 py-6 px-4 md:px-12 text-center text-xs text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">HireFlow</span>
            <span>— Enterprise Recruitment Email &amp; Document Automation</span>
          </div>
          <div>© 2026 HireFlow Technologies Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
