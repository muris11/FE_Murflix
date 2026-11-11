import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { SubscriptionPlan, UserRole } from '@/types/auth';
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminUserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as UserRole,
    plan_id: null as number | null,
    duration_unit: 'months',
    duration_value: 1,
  });

  useEffect(() => {
    adminApi.getPlans().then((data) => {
      setPlans(data || []);
      const defaultPlan = data.find((p) => p.duration_unit === 'months' && p.duration_value === 1);
      if (defaultPlan) {
        setFormData((prev) => ({
          ...prev,
          plan_id: defaultPlan.id,
          duration_unit: defaultPlan.duration_unit,
          duration_value: defaultPlan.duration_value,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setFormData((prev) => ({
      ...prev,
      plan_id: plan.id,
      duration_unit: plan.duration_unit,
      duration_value: plan.duration_value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await adminApi.createUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
        role: formData.role,
        plan_id: formData.plan_id,
        duration_unit: formData.duration_unit,
        duration_value: formData.duration_value,
      });

      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal membuat pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Pengguna</span>
      </button>

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800/80">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tambah Pengguna Baru</h1>
        <p className="text-xs text-zinc-400 mt-1">Buat akun akses dan atur durasi paket langganan</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center space-x-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
        {/* Email & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Email Pengguna <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Full Name & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Role Akses <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={() => setFormData({ ...formData, role: 'user' })}
                  className="text-red-600 focus:ring-red-600"
                />
                <span className="text-gray-300">Member Biasa</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={() => setFormData({ ...formData, role: 'admin' })}
                  className="text-red-600 focus:ring-red-600"
                />
                <span className="text-gray-300">Admin</span>
              </label>
            </div>
          </div>
        </div>

        {/* Subscription Plan Picker (Only for regular users) */}
        {formData.role === 'user' && (
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Pilih Paket Langganan</h3>
              <p className="text-xs text-gray-400">Pilih dari paket yang aktif di database atau tentukan durasi</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {plans.map((plan) => {
                const isSelected = formData.plan_id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-white absolute top-2 right-2" />
                    )}
                    <p className="font-bold text-white text-xs sm:text-sm">{plan.name}</p>
                    <p className="text-xs text-red-400 font-semibold mt-1">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{plan.description || ''}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-5 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700/60 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 text-zinc-400" />
            <span>{isSubmitting ? 'Membuat...' : 'Buat Pengguna'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

