import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Shield, Tag, Settings, Plus, ArrowRight } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { DashboardStats } from '@/types/admin';
import { User } from '@/types/auth';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.listUsers('', ''),
        ]);
        setStats(statsData);
        setRecentUsers(usersData.slice(0, 6));
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
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Pengguna', value: stats?.total_users || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pelanggan Aktif', value: stats?.active_users || 0, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Langganan Habis', value: stats?.expired_users || 0, icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Admin Sistem', value: stats?.admin_users || 0, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Paket Langganan', value: stats?.total_plans || 0, icon: Tag, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            Ringkasan status pengguna, paket langganan dan kontrol operasional Murflix
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users/create"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah User</span>
          </Link>
          <Link
            to="/admin/settings"
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
            title="Pengaturan API"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#181818] border border-gray-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Users Table */}
      <div className="bg-[#181818] border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Pengguna Terbaru</h2>
          <Link to="/admin/users" className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center space-x-1">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#121212] text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status Langganan</th>
                <th className="px-4 py-3">Masa Aktif</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-white">{u.full_name || 'Tanpa Nama'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      u.role === 'admin' || u.subscription_status === 'forever'
                        ? 'bg-blue-500/20 text-blue-400'
                        : u.subscription_status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.role === 'admin' ? 'Lifetime Admin' : u.subscription_status === 'forever' ? 'Selamanya' : u.subscription_status === 'active' ? 'Aktif' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {u.subscription_expires_at
                      ? new Date(u.subscription_expires_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Permanen'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/admin/users/${u.id}/edit`}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Edit
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

