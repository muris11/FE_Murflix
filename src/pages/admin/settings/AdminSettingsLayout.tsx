import React from 'react';
import { NavLink } from 'react-router-dom';
import { Tv, Key, UserCheck, Sliders, ChevronRight } from 'lucide-react';

interface AdminSettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const AdminSettingsLayout: React.FC<AdminSettingsLayoutProps> = ({
  children,
  title,
  description,
  action,
}) => {
  const tabs = [
    {
      to: '/admin/settings/servers',
      label: 'Server Streaming',
      icon: Tv,
      badge: 'Ad-Free',
    },
    {
      to: '/admin/settings/tmdb',
      label: 'API TMDB & Media',
      icon: Key,
    },
    {
      to: '/admin/settings/demo',
      label: 'Akun Demo',
      icon: UserCheck,
    },
    {
      to: '/admin/settings/general',
      label: 'Konfigurasi Umum',
      icon: Sliders,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-zinc-400">
        <NavLink to="/admin" className="hover:text-white transition-colors">
          Admin
        </NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <NavLink to="/admin/settings/servers" className="hover:text-white transition-colors">
          Pengaturan Sistem
        </NavLink>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-red-500 font-semibold">{title}</span>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        </div>
        {action && <div className="flex items-center space-x-3">{action}</div>}
      </div>

      {/* Sub-Route Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-zinc-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/30 text-white">
                  {tab.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Page Content */}
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
};

