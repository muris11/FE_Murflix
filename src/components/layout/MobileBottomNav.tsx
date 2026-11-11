import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Search, Bookmark, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Beranda', path: '/', icon: Home },
    { label: 'Film', path: '/browse/movies', icon: Film },
    { label: 'Series TV', path: '/browse/tv', icon: Tv },
    { label: 'Cari', path: '/search', icon: Search },
    { label: 'Daftar Saya', path: '/my-list', icon: Bookmark },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#101012]/92 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-[calc(env(safe-area-inset-bottom)+0.35rem)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                active ? 'text-[#e50914]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* Subtle top active indicator pill */}
              {active && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-[#e50914] rounded-full shadow-[0_0_8px_rgba(229,9,20,0.8)]" />
              )}

              <div
                className={`p-1 rounded-xl transition-transform duration-200 ${
                  active ? 'scale-110 drop-shadow-[0_2px_8px_rgba(229,9,20,0.4)]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>

              <span
                className={`text-[10px] tracking-tight transition-all ${
                  active ? 'font-bold text-white scale-105' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Optional Admin Shortcut if logged in as Admin */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              currentPath.startsWith('/admin') ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {currentPath.startsWith('/admin') && (
              <span className="absolute -top-1.5 w-6 h-0.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
            <div className="p-1 rounded-xl">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

