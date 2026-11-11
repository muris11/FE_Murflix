import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Tag,
  Settings,
  Plus,
  ArrowRight,
  Activity,
  Globe,
  Navigation,
  Eye,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import { DashboardStats } from '@/types/admin';
import { AnalyticsOverview } from '@/types/analytics';
import { User } from '@/types/auth';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, usersData, analyticsData] = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.listUsers('', ''),
          adminApi.getAnalyticsOverview(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (usersData.status === 'fulfilled') setRecentUsers(usersData.value.slice(0, 6));
        if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-600 border-t-red-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Pengguna', value: stats?.total_users || 0, icon: Users },
    { label: 'Pelanggan Aktif', value: stats?.active_users || 0, icon: UserCheck },
    { label: 'Langganan Berakhir', value: stats?.expired_users || 0, icon: UserX },
    { label: 'Administrator', value: stats?.admin_users || 0, icon: Shield },
    { label: 'Paket Langganan', value: stats?.total_plans || 0, icon: Tag },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Konsol Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ringkasan status pengguna, paket langganan, dan pemantauan operasional Murflix.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/admin/users/create"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#e50914] hover:bg-red-700 text-white font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </Link>
          <Link
            to="/admin/settings/servers"
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
            title="Pengaturan Sistem"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{card.label}</span>
                <Icon className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Visitor Intelligence Overview Card */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-base font-semibold text-white">
              Intelijen Pengunjung &amp; Geolokasi
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Deteksi alamat IP publik, koordinat GPS lintang dan bujur, provider ISP, serta perangkat pengunjung secara real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <Link
              to="/admin/analytics"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-zinc-400" />
              <span>Buka Peta Radar</span>
            </Link>
            <Link
              to="/admin/analytics/logs"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Log Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Live Visitor Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="border border-zinc-800/80 rounded-xl p-3.5 bg-[#0e0e11] space-y-1">
            <span className="text-xs font-medium text-zinc-400 block">Pengunjung Aktif</span>
            <p className="text-2xl font-bold text-white tracking-tight">{analytics?.active_visitors ?? 0}</p>
            <span className="text-[11px] text-zinc-500 block">5 menit terakhir</span>
          </div>

          <div className="border border-zinc-800/80 rounded-xl p-3.5 bg-[#0e0e11] space-y-1">
            <span className="text-xs font-medium text-zinc-400 block">Kunjungan Hari Ini</span>
            <p className="text-2xl font-bold text-white tracking-tight">{analytics?.visits_today ?? 0}</p>
            <span className="text-[11px] text-zinc-500 block">Total akumulasi: {analytics?.total_visits ?? 0}</span>
          </div>

          <div className="border border-zinc-800/80 rounded-xl p-3.5 bg-[#0e0e11] space-y-1">
            <span className="text-xs font-medium text-zinc-400 block">IP Unik</span>
            <p className="text-2xl font-bold text-white tracking-tight">{analytics?.unique_ips_today ?? 0}</p>
            <span className="text-[11px] text-zinc-500 block">Total IP unik: {analytics?.unique_ips ?? 0}</span>
          </div>

          <div className="border border-zinc-800/80 rounded-xl p-3.5 bg-[#0e0e11] space-y-1">
            <span className="text-xs font-medium text-zinc-400 block">Koordinat Terpetakan</span>
            <p className="text-2xl font-bold text-white tracking-tight">{analytics?.recent_visitors?.length ?? 0}</p>
            <span className="text-[11px] text-zinc-500 block">Titik GPS aktif</span>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white">Pengguna Terbaru</h2>
          <Link to="/admin/users" className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 transition-colors">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-3">Pengguna</th>
                <th className="py-2.5 px-3">Peran (Role)</th>
                <th className="py-2.5 px-3">Status Langganan</th>
                <th className="py-2.5 px-3">Masa Berlaku</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-semibold text-white">{u.full_name || 'Tanpa Nama'}</p>
                      <p className="text-[11px] text-zinc-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${u.role === 'admin' ? 'text-purple-400' : 'text-zinc-400'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Pengguna'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-medium ${
                      u.role === 'admin' || u.subscription_status === 'forever'
                        ? 'text-blue-400'
                        : u.subscription_status === 'active'
                        ? 'text-emerald-400'
                        : 'text-zinc-500'
                    }`}>
                      {u.role === 'admin' ? 'Akses Permanen' : u.subscription_status === 'forever' ? 'Selamanya' : u.subscription_status === 'active' ? 'Aktif' : 'Kedaluwarsa'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                    {u.subscription_expires_at
                      ? new Date(u.subscription_expires_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Permanen'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/users/${u.id}/edit`}
                      className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
