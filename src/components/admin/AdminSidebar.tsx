import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Tag,
  Settings,
  Film,
  LogOut,
  ChevronDown,
  Activity,
  MapPin,
  Tv,
  Key,
  UserCheck,
  Sliders,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
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
          subItems: [
            {
              label: 'Peta Koordinat & Radar',
              path: '/admin/analytics',
              icon: Activity,
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
      title: 'Pengaturan Sistem',
      items: [
        {
          label: 'Konfigurasi Layanan',
          path: '/admin/settings/servers',
          icon: Settings,
          subItems: [
            {
              label: 'Server Streaming',
              path: '/admin/settings/servers',
              icon: Tv,
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
    <aside className="w-64 bg-[#0e0e11] border-r border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto scrollbar-none">
        
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-zinc-800/70 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5" onClick={onItemClick}>
            <MurflixLogo size="sm" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
              Konsol
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  {section.title}
                </div>
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
                    {/* Main Nav Item */}
                    <div className="flex items-center">
                      <Link
                        to={item.subItems ? item.subItems[0].path : item.path}
                        onClick={onItemClick}
                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          parentActive && !hasSub
                            ? 'bg-zinc-800/90 text-white font-semibold'
                            : parentActive
                            ? 'text-white bg-zinc-800/50 font-semibold'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${parentActive ? 'text-red-500' : 'text-zinc-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </Link>

                      {hasSub && (
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(menuKey)}
                          className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors ml-0.5"
                          title="Buka atau tutup menu"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub Items */}
                    {hasSub && isExpanded && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l border-zinc-800/70 ml-5 my-1">
                        {item.subItems!.map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = isExactActive(sub.path);

                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={onItemClick}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                subActive
                                  ? 'bg-zinc-800 text-white font-semibold'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${subActive ? 'text-red-500' : 'text-zinc-500'}`} />
                                <span className="truncate">{sub.label}</span>
                              </div>
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

      {/* User Info & Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0a0a0c] space-y-2">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors"
        >
          <Film className="w-4 h-4 text-zinc-500" />
          <span>Kembali ke Streaming</span>
        </Link>

        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between px-1">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            title="Keluar akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
