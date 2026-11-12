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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteUser(deleteModalId);
      setDeleteModalId(null);
      fetchUsers();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Gagal menghapus user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Pengguna</h1>
          <p className="text-xs text-zinc-400 mt-1">Daftar seluruh akun member dan subscription di Murflix</p>
        </div>

        <Link
          to="/admin/users/create"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
          <span>Tambah Pengguna</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#121215] border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Cari email atau nama pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-zinc-800/80 text-white placeholder-zinc-500 rounded-lg px-3 py-2 pl-9 text-xs focus:outline-none focus:border-zinc-600"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto">
          {['', 'active', 'expired', 'admin'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {status === '' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0e0e11] text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80 font-medium">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-4 py-3">Langganan</th>
                <th className="px-4 py-3">Kedaluwarsa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-500">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">{u.full_name || 'Tanpa Nama'}</p>
                        <p className="text-[11px] text-zinc-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold capitalize ${u.role === 'admin' ? 'text-purple-400' : 'text-zinc-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${u.is_active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        u.role === 'admin' || u.subscription_status === 'forever'
                          ? 'text-blue-400'
                          : u.subscription_status === 'active'
                          ? 'text-emerald-400'
                          : 'text-zinc-500'
                      }`}>
                        {u.role === 'admin' ? 'Selamanya' : u.subscription_status === 'forever' ? 'Selamanya' : u.subscription_status === 'active' ? 'Aktif' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-400 font-mono">
                      {u.subscription_expires_at
                        ? new Date(u.subscription_expires_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Permanen'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModalId(u.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-rose-400 flex items-center justify-center mx-auto border border-zinc-700/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Konfirmasi Hapus</h3>
              <p className="text-xs text-gray-400 mt-1">
                Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              {deleteError && (
                <p className="text-xs text-red-400 font-medium mt-2 bg-red-950/40 p-2 rounded-lg border border-red-800/60">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModalId(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

