import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Film, LogOut, ChevronRight, LayoutDashboard, Users, Tag, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Pengguna', path: '/admin/users', icon: Users },
    { label: 'Paket & Harga Langganan', path: '/admin/pricing', icon: Tag },
    { label: 'Pengaturan & Akun Demo', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#111114] border-r border-zinc-800">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-black text-[#e50914] tracking-wider">MURFLIX</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 sm:p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3 bg-[#0d0d10]">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Film className="w-4 h-4 text-[#e50914]" />
          <span>Ke Halaman Streaming</span>
        </Link>

        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col lg:flex-row">
      
      {/* Mobile Top App Bar (lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#121215]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/admin" className="flex items-center space-x-1.5">
            <span className="text-lg font-black text-[#e50914] tracking-wider">MURFLIX</span>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
              Admin
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/80"
        >
          Web
        </Link>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-fadeIn">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area (Adaptive, never overflows) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
