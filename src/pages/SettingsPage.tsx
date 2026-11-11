import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Upload,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  CreditCard,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { uploadAvatarImage, getAvatarUrl } from '@/utils/avatarConverter';
import { NETFLIX_AVATAR_PRESETS } from '@/types/profile';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeProfile, refreshUser, refreshProfiles } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || activeProfile?.avatar_url || '/avatars/avatar-red.svg');
  const [isUploading, setIsUploading] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);
    try {
      // Auto converts to WebP with random filename and returns FE static path
      const uploadedUrl = await uploadAvatarImage(file);
      setAvatarUrl(uploadedUrl);
      setSuccessMessage('Gambar berhasil dikonversi ke WebP dan diunggah.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Gagal mengunggah avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Update account name and avatar
      await profilesApi.updateAccount({
        full_name: fullName.trim() || undefined,
        avatar_url: avatarUrl,
      });

      // Also update active sub-profile avatar if present
      if (activeProfile) {
        await profilesApi.updateProfile(activeProfile.id, {
          name: fullName.trim() || activeProfile.name,
          avatar_url: avatarUrl,
        });
      }

      await refreshUser();
      await refreshProfiles();
      setSuccessMessage('Profil dan avatar berhasil diperbarui!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 w-full text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Pengaturan Akun &amp; Profil</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Kelola informasi profil, avatar, dan keamanan akun Anda
            </p>
          </div>

          <button
            onClick={() => navigate('/profiles?manage=true')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition-all self-start sm:self-auto"
          >
            <Users className="w-4 h-4 text-red-500" />
            <span>Kelola Multi-Profil Netflix</span>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-xs sm:text-sm animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Profil & Avatar */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-zinc-800/80 pb-4">
            <UserIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Informasi Profil &amp; Avatar</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Preview & Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-black border-2 border-red-600 shadow-xl flex-shrink-0">
                <img
                  src={getAvatarUrl(avatarUrl)}
                  alt="Avatar Pengguna"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2.5 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Ubah Foto Avatar
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 shadow-md transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Mengonversi ke WebP...' : 'Unggah Avatar Baru (.webp)'}</span>
                </button>
                <p className="text-xs text-gray-400">
                  Gambar yang diunggah akan otomatis dikonversi ke format <strong>.webp</strong> beresolusi optimal dan disimpan dengan nama acak pada domain frontend.
                </p>
              </div>
            </div>

            {/* Avatar Preset Grid */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                Atau Pilih Preset Avatar Netflix
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2.5 p-1">
                {NETFLIX_AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-transform hover:scale-110 ${
                        isSelected ? 'border-red-600 ring-2 ring-red-600 scale-105' : 'border-transparent'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Email Akun (ID Login)
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-zinc-900 border border-zinc-800 text-gray-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                Nama Lengkap / Nama Tampilan
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama tampilan Anda..."
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-600/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Informasi Langganan */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-zinc-800/80 pb-4">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">Status Paket &amp; Langganan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="block text-xs text-gray-400 font-semibold uppercase">Paket Aktif</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                {user?.plan_name || 'Member Standar'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="block text-xs text-gray-400 font-semibold uppercase">Status Akses</span>
              <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                {user?.role === 'admin' ? 'Super Admin (Akses Penuh)' : 'Aktif (Dapat Menonton)'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="block text-xs text-gray-400 font-semibold uppercase">Masa Berlaku</span>
              <span className="text-base font-extrabold text-zinc-300 mt-1 block">
                {user?.subscription_status === 'forever' || user?.role === 'admin'
                  ? 'Selamanya (Permanen)'
                  : user?.subscription_expires_at
                  ? new Date(user.subscription_expires_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Aktif'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

