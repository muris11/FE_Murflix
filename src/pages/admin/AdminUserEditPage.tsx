import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { SubscriptionPlan, User } from '@/types/auth';
import { ArrowLeft, Save, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

export const AdminUserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isActive, setIsActive] = useState(true);
  const [extendOption, setExtendOption] = useState<'keep' | 'new'>('keep');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [durationUnit, setDurationUnit] = useState('months');
  const [durationValue, setDurationValue] = useState(1);

  useEffect(() => {
    if (!id) return;
    Promise.all([adminApi.getUser(id), adminApi.getPlans()])
      .then(([userData, plansData]) => {
        setUser(userData);
        setFullName(userData.full_name || '');
        setRole(userData.role);
        setIsActive(userData.is_active);
        setPlans(plansData || []);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat data pengguna');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (newPassword.trim() && newPassword.trim().length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await adminApi.updateUser(id, {
        full_name: fullName,
        role,
        is_active: isActive,
        extend_option: extendOption,
        plan_id: selectedPlanId,
        duration_unit: durationUnit,
        duration_value: durationValue,
        password: newPassword.trim() ? newPassword.trim() : undefined,
      });

      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Pengguna</span>
      </button>

      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Edit Pengguna</h1>
        <p className="text-sm text-gray-400 mt-1">Ubah profil atau perpanjang masa aktif akun {user?.email}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#181818] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Email Read-only */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Email (ID Akun)
          </label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="w-full bg-gray-900 border border-gray-800 text-gray-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Password Reset Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
            Ganti Password Baru (Opsional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password..."
              minLength={6}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Minimal 6 karakter. Kosongkan bidang ini jika ingin mempertahankan password yang sedang digunakan.
          </p>
        </div>

        {/* Role & Status Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Role Akses
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="user">Member Biasa</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Status Akun
            </label>
            <div className="flex items-center space-x-3 pt-1">
              <input
                type="checkbox"
                id="is_active_toggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-red-600 focus:ring-red-600"
              />
              <label htmlFor="is_active_toggle" className="text-sm font-medium text-gray-200 cursor-pointer">
                {isActive ? 'Akun Aktif (Dapat Login)' : 'Nonaktifkan Akun (Diblokir)'}
              </label>
            </div>
          </div>
        </div>

        {/* Subscription Extension */}
        {role === 'user' && (
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Kelola Masa Aktif Langganan</h3>
            
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="extendOption"
                  checked={extendOption === 'keep'}
                  onChange={() => setExtendOption('keep')}
                  className="text-red-600 focus:ring-red-600"
                />
                <span className="text-gray-300">Biarkan Masa Aktif Saat Ini</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="extendOption"
                  checked={extendOption === 'new'}
                  onChange={() => setExtendOption('new')}
                  className="text-red-600 focus:ring-red-600"
                />
                <span className="text-gray-300">Perpanjang / Beri Paket Baru</span>
              </label>
            </div>

            {extendOption === 'new' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setDurationUnit(p.duration_unit);
                      setDurationValue(p.duration_value);
                    }}
                    className={`cursor-pointer rounded-xl p-3 border text-xs transition-all ${
                      selectedPlanId === p.id
                        ? 'bg-red-500/20 border-red-500 text-white font-bold ring-1 ring-red-500'
                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <p>{p.name}</p>
                    <p className="text-red-400 font-semibold mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

