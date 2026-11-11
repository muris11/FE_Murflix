import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { User } from '@/types/auth';
import { Plus, Search, Edit2, Trash2, Shield, AlertTriangle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listUsers(search, statusFilter);
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      await adminApi.deleteUser(deleteModalId);
      setDeleteModalId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kelola Pengguna</h1>
          <p className="text-sm text-gray-400 mt-1">Daftar seluruh akun member dan subscription di Murflix</p>
        </div>

        <Link
          to="/admin/users/create"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#181818] border border-gray-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Cari email atau nama pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['', 'active', 'expired', 'admin'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status === '' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#181818] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#121212] text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status Akun</th>
                <th className="px-5 py-4">Langganan</th>
                <th className="px-5 py-4">Kedaluwarsa</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">{u.full_name || 'Tanpa Nama'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.role === 'admin' || u.subscription_status === 'forever'
                          ? 'bg-blue-500/20 text-blue-400'
                          : u.subscription_status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.role === 'admin' ? 'Selamanya' : u.subscription_status === 'forever' ? 'Selamanya' : u.subscription_status === 'active' ? 'Aktif' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {u.subscription_expires_at
                        ? new Date(u.subscription_expires_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Permanen'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-400 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModalId(u.id)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Konfirmasi Hapus</h3>
              <p className="text-xs text-gray-400 mt-1">
                Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-lg shadow-red-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

