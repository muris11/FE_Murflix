import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Film, Shield, ExternalLink, LogOut } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { MurflixLogo } from '@/components/layout/MurflixLogo';
import { useAuth } from '@/contexts/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin') return 'Dashboard Overview';
    if (p.includes('/admin/analytics/logs')) return 'Log Lengkap Pengunjung';
    if (p.includes('/admin/analytics')) return 'Intelijen Pengunjung & Radar';
    if (p.includes('/admin/users/create')) return 'Tambah Pengguna Baru';
    if (p.includes('/admin/users')) return 'Manajemen Pengguna';
    if (p.includes('/admin/pricing')) return 'Paket & Harga Langganan';
    if (p.includes('/admin/settings/whatsapp')) return 'Integrasi WhatsApp';
    if (p.includes('/admin/settings/servers')) return 'Server Streaming Player';
    if (p.includes('/admin/settings/tmdb')) return 'Kredensial API TMDB';
    if (p.includes('/admin/settings/demo')) return 'Pengaturan Akun Demo';
    if (p.includes('/admin/settings/general')) return 'Konfigurasi Sistem Global';
    return 'Konsol Administrator';
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col lg:flex-row font-sans selection:bg-red-600 selection:text-white">
      {/* Mobile Top App Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0e0e11]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/admin" className="flex items-center space-x-2">
            <MurflixLogo size="sm" />
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800/60">
              Admin
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center space-x-1.5 transition-colors"
        >
          <Film className="w-3.5 h-3.5 text-red-500" />
          <span>Streaming</span>
        </Link>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 border-r border-zinc-800/80 bg-[#0c0c0e]">
        <AdminSidebar />
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 bg-[#0e0e11] shadow-2xl flex flex-col border-r border-zinc-800">
            <div className="p-3 flex justify-end border-b border-zinc-800/80">
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Desktop Sleek Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#0e0e11]/90 backdrop-blur-md border-b border-zinc-800/80 px-8 py-3.5 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-zinc-200">{getPageTitle()}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-500 text-[11px] font-mono">Murflix Core v2.4</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="text-zinc-300">Sistem Berjalan Normal</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition-colors"
            >
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>Buka Streaming</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>

            <div className="flex items-center space-x-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                {(user?.full_name || 'A')[0].toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-zinc-200 leading-none">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-zinc-500 leading-none mt-1">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
