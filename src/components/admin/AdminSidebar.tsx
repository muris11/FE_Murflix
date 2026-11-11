import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Tag,
  Settings,
  Film,
  LogOut,
  ChevronRight,
  ChevronDown,
  Activity,
  MapPin,
  Tv,
  Key,
  UserCheck,
  Sliders,
  Radio,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  subItems?: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const AdminSidebar: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    analytics: true,
    settings: true,
    users: true,
  });

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      items: [
        {
          label: 'Overview',
          path: '/admin',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Intelijen & Akses',
      items: [
        {
          label: 'Pelacakan Pengunjung',
          path: '/admin/analytics',
          icon: Activity,
          badge: 'LIVE',
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
          subItems: [
            {
              label: 'Peta Koordinat & KPI',
              path: '/admin/analytics',
              icon: Radio,
            },
            {
              label: 'Log Pengunjung & IP',
              path: '/admin/analytics/logs',
              icon: MapPin,
            },
          ],
        },
      ],
    },
    {
      title: 'Manajemen Akun',
      items: [
        {
          label: 'Kelola Pengguna',
          path: '/admin/users',
          icon: Users,
          subItems: [
            {
              label: 'Daftar Pengguna',
              path: '/admin/users',
              icon: Users,
            },
            {
              label: 'Tambah Pengguna Baru',
              path: '/admin/users/create',
              icon: UserPlus,
            },
          ],
        },
        {
          label: 'Paket & Harga Langganan',
          path: '/admin/pricing',
          icon: Tag,
        },
      ],
    },
    {
      title: 'Kontrol Sistem',
      items: [
        {
          label: 'Pengaturan Sistem',
          path: '/admin/settings/servers',
          icon: Settings,
          subItems: [
            {
              label: 'Server Streaming',
              path: '/admin/settings/servers',
              icon: Tv,
              badge: 'Ad-Free',
            },
            {
              label: 'API TMDB & Media',
              path: '/admin/settings/tmdb',
              icon: Key,
            },
            {
              label: 'Akun Demo',
              path: '/admin/settings/demo',
              icon: UserCheck,
            },
            {
              label: 'Konfigurasi Umum',
              path: '/admin/settings/general',
              icon: Sliders,
            },
          ],
        },
      ],
    },
  ];

  const isExactActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path === '/admin') return location.pathname === '/admin';
    if (item.subItems) {
      return item.subItems.some((s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/'));
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="w-64 bg-[#111114] border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800">
          <Link to="/" className="flex items-center space-x-2" onClick={onItemClick}>
            <MurflixLogo size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-500/40 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium">Pusat Kendali & Intelijen</p>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const parentActive = isParentActive(item);
                const hasSub = item.subItems && item.subItems.length > 0;
                const menuKey = item.path.includes('analytics')
                  ? 'analytics'
                  : item.path.includes('settings')
                  ? 'settings'
                  : 'users';
                const isExpanded = expandedMenus[menuKey] ?? true;

                return (
                  <div key={item.path} className="space-y-0.5">
                    {/* Main Item */}
                    <div className="flex items-center">
                      <Link
                        to={item.subItems ? item.subItems[0].path : item.path}
                        onClick={onItemClick}
                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          parentActive && !hasSub
                            ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                            : parentActive
                            ? 'text-white bg-zinc-800/80 font-bold'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${parentActive ? 'text-red-500' : 'text-zinc-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {hasSub && (
                        <button
                          onClick={() => toggleSubmenu(menuKey)}
                          className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors ml-1"
                          title="Buka / Tutup Sub-menu"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub Items (Clean Nested Routes) */}
                    {hasSub && isExpanded && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l border-zinc-800/80 ml-5 my-1">
                        {item.subItems!.map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = isExactActive(sub.path);

                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={onItemClick}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                subActive
                                  ? 'bg-[#e50914] text-white font-bold shadow-sm'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-medium'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{sub.label}</span>
                              </div>
                              {sub.badge && (
                                <span className="text-[9px] font-bold px-1 rounded bg-black/40 text-emerald-400">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Info & Streaming Link */}
      <div className="p-3 border-t border-zinc-800 space-y-2 bg-[#0c0c0f]">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
        >
          <Film className="w-4 h-4 text-red-500" />
          <span>Ke Halaman Streaming</span>
        </Link>

        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between px-1">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
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
    </aside>
  );
};
