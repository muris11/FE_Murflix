import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, Settings, Film, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Pengguna', path: '/admin/users', icon: Users },
    { label: 'Paket & Harga Langganan', path: '/admin/pricing', icon: Tag },
    { label: 'Pengaturan & API Keys', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <MurflixLogo size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-500/40 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Sistem Manajemen & Kontrol</p>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
        >
          <Film className="w-4 h-4 text-gray-400" />
          <span>Ke Halaman Streaming</span>
        </Link>

        <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

