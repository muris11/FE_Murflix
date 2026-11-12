import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { SubscriptionPlan, SubscriptionDurationUnit } from '@/types/auth';
import { Tag, Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export const AdminPricingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_unit: 'months' as SubscriptionDurationUnit,
    duration_value: 1,
    price: 50000,
    currency: 'IDR',
    description: '',
    is_active: true,
  });

  const fetchPlans = async () => {
    try {
      const data = await adminApi.getPlans();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      duration_unit: 'months',
      duration_value: 1,
      price: 50000,
      currency: 'IDR',
      description: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_unit: plan.duration_unit,
      duration_value: plan.duration_value,
      price: plan.price,
      currency: plan.currency,
      description: plan.description || '',
      is_active: plan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, formData);
      } else {
        await adminApi.createPlan(formData);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Gagal menyimpan paket');
    }
  };

  const executeDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await adminApi.deletePlan(planToDelete.id);
      setPlanToDelete(null);
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Harga & Paket</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola harga sewa, trial, bulanan, dan paket langganan permanen untuk member
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Grid of Plans */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#181818] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl ${
                plan.is_active ? 'border-gray-800' : 'border-gray-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    {plan.duration_unit === 'forever' ? 'Lifetime' : `${plan.duration_value} ${plan.duration_unit}`}
                  </span>

                  <span className={`text-[11px] font-medium ${
                    plan.is_active ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {plan.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-2xl font-black text-white mt-2">
                  Rp {plan.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                  {plan.description || 'Tidak ada keterangan tambahan.'}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-5 mt-4 border-t border-gray-800/80">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => setPlanToDelete(plan)}
                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 hover:text-white text-gray-400 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingPlan ? 'Ubah Paket Langganan' : 'Tambah Paket Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: 1 Bulan Premium"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">Satuan Durasi</label>
                  <select
                    value={formData.duration_unit}
                    onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="hours">Jam (Trial/Sewa)</option>
                    <option value="days">Hari</option>
                    <option value="months">Bulan</option>
                    <option value="years">Tahun</option>
                    <option value="forever">Selamanya (Permanen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">Nilai Durasi</label>
                  <input
                    type="number"
                    min="1"
                    disabled={formData.duration_unit === 'forever'}
                    value={formData.duration_value}
                    onChange={(e) => setFormData({ ...formData, duration_value: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">Harga (Rupiah)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan singkat paket..."
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="plan_active_toggle"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 bg-gray-900 border-gray-700 focus:ring-red-600"
                />
                <label htmlFor="plan_active_toggle" className="text-xs text-gray-300 cursor-pointer">
                  Aktifkan paket untuk pilihan pembuatan user
                </label>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Plan Modal */}
      <ConfirmModal
        isOpen={!!planToDelete}
        title={planToDelete ? `Hapus Paket "${planToDelete.name}"?` : 'Hapus Paket?'}
        message="Paket langganan ini akan dihapus dari pilihan paket admin."
        confirmText="Hapus Paket"
        cancelText="Batal"
        variant="danger"
        onConfirm={executeDeletePlan}
        onClose={() => setPlanToDelete(null)}
      />
    </div>
  );
};

