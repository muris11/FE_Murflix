import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col lg:flex-row">
      {/* Mobile Top App Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#121215]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/admin" className="flex items-center space-x-2">
            <MurflixLogo size="sm" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
              Konsol
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/80"
        >
          Streaming
        </Link>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 bg-[#111114] shadow-2xl flex flex-col">
            <div className="p-3 flex justify-end border-b border-zinc-800/60">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminSidebar onItemClick={() => setIsMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
};
