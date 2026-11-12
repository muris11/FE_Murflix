import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Check, Trash2, Upload, X, ArrowLeft, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { UserProfile, NETFLIX_AVATAR_PRESETS } from '@/types/profile';
import { uploadAvatarImage, getAvatarUrl } from '@/utils/avatarConverter';
import { MurflixLogo } from '@/components/layout/MurflixLogo';
import { ProfilePinModal } from '@/components/profile/ProfilePinModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export const ProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';
  const { profiles, activeProfile, selectProfile, refreshProfiles, logout } = useAuth();

  const [isManaging, setIsManaging] = useState(searchParams.get('manage') === 'true');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [pinModalProfile, setPinModalProfile] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar-red.svg');
  const [isKids, setIsKids] = useState(false);
  const [enablePin, setEnablePin] = useState(false);
  const [profilePin, setProfilePin] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsProfilesLoading(true);
    refreshProfiles().finally(() => {
      setIsProfilesLoading(false);
    });
  }, [refreshProfiles]);

  const handleSelect = (profile: UserProfile) => {
    if (isManaging) {
      openEditModal(profile);
      return;
    }

    // If profile is PIN locked and not already active, trigger PIN prompt
    if (profile.has_pin && activeProfile?.id !== profile.id) {
      setPinModalProfile(profile);
      return;
    }

    selectProfile(profile);
    navigate(redirectTarget);
  };

  const handlePinSuccess = () => {
    if (pinModalProfile) {
      selectProfile(pinModalProfile);
      setPinModalProfile(null);
      navigate(redirectTarget);
    }
  };

  const openCreateModal = () => {
    setError(null);
    setProfileName('');
    setSelectedAvatar('/avatars/avatar-blue.svg');
    setIsKids(false);
    setEnablePin(false);
    setProfilePin('');
    setEditingProfile(null);
    setModalMode('create');
  };

  const openEditModal = (profile: UserProfile) => {
    setError(null);
    setProfileName(profile.name);
    setSelectedAvatar(profile.avatar_url || '/avatars/avatar-red.svg');
    setIsKids(profile.is_kids);
    setEnablePin(!!profile.has_pin);
    setProfilePin('');
    setEditingProfile(profile);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingProfile(null);
    setEnablePin(false);
    setProfilePin('');
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    const previous = selectedAvatar;
    setSelectedAvatar(localPreview);

    try {
      // Auto converts to WebP and uploads to frontend static directory with random filename
      const uploadedUrl = await uploadAvatarImage(file);
      setSelectedAvatar(uploadedUrl);
    } catch (err: any) {
      setSelectedAvatar(previous);
      setError(err.response?.data?.error || err.message || 'Gagal mengunggah avatar');
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setError('Nama profil wajib diisi');
      return;
    }

    if (enablePin && profilePin && profilePin.length !== 4) {
      setError('PIN harus berupa 4 digit angka');
      return;
    }

    if (enablePin && modalMode === 'create' && !profilePin) {
      setError('PIN 4 digit wajib diisi jika kunci profil diaktifkan');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        const created = await profilesApi.createProfile({
          name: profileName.trim(),
          avatar_url: selectedAvatar,
          is_kids: isKids,
          pin: enablePin ? profilePin : '',
        });
        await refreshProfiles();
        selectProfile(created);
        closeModal();
      } else if (modalMode === 'edit' && editingProfile) {
        let pinPayload: string | undefined = undefined;
        if (enablePin) {
          if (profilePin) {
            pinPayload = profilePin;
          } else if (!editingProfile.has_pin) {
            setError('PIN 4 digit wajib diisi');
            setIsSubmitting(false);
            return;
          }
        } else {
          // If unchecking PIN, clear it by sending empty string
          if (editingProfile.has_pin) {
            pinPayload = '';
          }
        }

        const updated = await profilesApi.updateProfile(editingProfile.id, {
          name: profileName.trim(),
          avatar_url: selectedAvatar,
          is_kids: isKids,
          ...(pinPayload !== undefined ? { pin: pinPayload } : {}),
        });
        await refreshProfiles();
        if (activeProfile?.id === editingProfile.id) {
          selectProfile(updated);
        }
        closeModal();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menyimpan profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!editingProfile) return;
    setIsSubmitting(true);
    try {
      await profilesApi.deleteProfile(editingProfile.id);
      await refreshProfiles();
      setShowDeleteConfirm(false);
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menghapus profil');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between selection:bg-[#e50914] selection:text-white">
      {/* Top Header */}
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MurflixLogo size="md" />
        </div>
        {activeProfile ? (
          <button
            onClick={() => navigate(redirectTarget)}
            className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span>Keluar Akun</span>
          </button>
        )}
      </header>

      {/* Main Profiles Center Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-16 max-w-7xl 2xl:max-w-[1600px] mx-auto w-full text-center my-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 sm:mb-12 animate-fadeIn">
          {isManaging ? 'Kelola Profil' : 'Siapa yang Sedang Menonton?'}
        </h1>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 2xl:gap-14 max-w-6xl">
          {isProfilesLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3 animate-pulse">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-2xl bg-zinc-800 border-2 border-white/10 shadow-2xl" />
                <div className="w-20 h-4 bg-zinc-800 rounded-md" />
              </div>
            ))
          ) : (
            profiles.map((p) => {
            const isActive = activeProfile?.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                {/* Avatar Wrapper */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-transparent group-hover:border-white shadow-2xl transition-all duration-300">
                  <img
                    src={getAvatarUrl(p.avatar_url)}
                    alt={p.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Active Indicator Border */}
                  {isActive && !isManaging && (
                    <div className="absolute inset-0 ring-4 ring-red-600 rounded-2xl pointer-events-none" />
                  )}

                  {/* Lock Indicator (Netflix Style PIN Lock) */}
                  {p.has_pin && !isManaging && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center shadow-lg"
                      title="Profil Diproteksi PIN"
                    >
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Manage Overlay with Pencil */}
                  {isManaging && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-black/80 border border-white/40 flex items-center justify-center">
                        <Edit2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Kids Pill Badge */}
                  {p.is_kids && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                      KIDS
                    </div>
                  )}
                </div>

                {/* Profile Name & Lock Status */}
                <div className="mt-3 flex items-center space-x-1.5 max-w-[120px] sm:max-w-[160px] justify-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-400 group-hover:text-white transition-colors truncate">
                    {p.name}
                  </span>
                  {p.has_pin && <Lock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />}
                </div>
              </div>
            );
          }))}

          {/* Add Profile Card */}
          <div
            onClick={openCreateModal}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-2xl border-2 border-dashed border-zinc-700 group-hover:border-white group-hover:bg-zinc-800/60 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all duration-300 shadow-xl">
              <Plus className="w-10 h-10 sm:w-14 sm:h-14 stroke-1" />
            </div>
            <span className="mt-3 text-sm sm:text-base font-semibold text-gray-400 group-hover:text-white transition-colors">
              Tambah Profil
            </span>
          </div>
        </div>

        {/* Action Button: Kelola Profil / Selesai */}
        <div className="mt-14">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`px-8 py-2.5 rounded-none border text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
              isManaging
                ? 'bg-white text-black border-white hover:bg-gray-200 shadow-xl'
                : 'bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-white'
            }`}
          >
            {isManaging ? 'Selesai' : 'Kelola Profil'}
          </button>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} Murflix Streaming Hub
      </footer>

      {/* ----------------------------------------------------------------- */}
      {/* Modal: Tambah / Edit Profil                                      */}
      {/* ----------------------------------------------------------------- */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {modalMode === 'create' ? 'Tambah Profil Baru' : 'Edit Profil'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Kustomisasi nama, avatar, dan preferensi untuk profil ini.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Selected Avatar Preview & Custom Upload */}
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black border-2 border-red-600 shadow-xl flex-shrink-0">
                  <img
                    src={getAvatarUrl(selectedAvatar)}
                    alt="Selected Avatar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/avatars/avatar-red.svg')) return;
                      target.src = '/avatars/avatar-red.svg?v=2';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-gray-300">
                    Avatar Profil
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
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-zinc-700 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Mengonversi ke WebP...' : 'Upload Gambar Baru'}</span>
                  </button>
                  <p className="text-[11px] text-zinc-500">
                    Otomatis dikonversi ke format .webp dengan nama acak.
                  </p>
                </div>
              </div>

              {/* Avatar Preset Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                  Atau Pilih Preset Avatar Netflix
                </label>
                <div className="grid grid-cols-6 gap-2.5 max-h-36 overflow-y-auto no-scrollbar p-1">
                  {NETFLIX_AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedAvatar(preset.url)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-transform hover:scale-110 ${
                          isSelected ? 'border-red-600 ring-2 ring-red-600 scale-105' : 'border-transparent'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('/avatars/avatar-red.svg')) return;
                            target.src = '/avatars/avatar-red.svg?v=2';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Profile Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Nama Profil
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Misal: Rifqy, Keluarga, Nonton Bareng..."
                  maxLength={30}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Kids Mode Toggle */}
              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="is_kids_toggle"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 cursor-pointer"
                />
                <label htmlFor="is_kids_toggle" className="text-xs sm:text-sm text-gray-300 cursor-pointer font-medium">
                  Profil Anak? (Hanya menampilkan tontonan ramah keluarga &amp; anak)
                </label>
              </div>

              {/* Profile PIN Lock Configuration (Netflix 1:1) */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Lock className="w-4 h-4 text-red-500" />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-white">Kunci Profil (PIN 4-Digit)</span>
                      <span className="text-[11px] text-zinc-400">Butuh PIN untuk mengakses profil ini</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="enable_pin_toggle"
                    checked={enablePin}
                    onChange={(e) => {
                      setEnablePin(e.target.checked);
                      if (!e.target.checked) setProfilePin('');
                    }}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                </div>

                {enablePin && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-left animate-fadeIn">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                      {editingProfile?.has_pin ? 'Ubah PIN 4 Digit (Kosongkan jika tetap)' : 'Buat PIN 4 Digit'}
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={profilePin}
                      onChange={(e) => setProfilePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={editingProfile?.has_pin ? 'PIN Aktif (Isi untuk ganti)' : 'Misal: 1234'}
                      className="w-40 bg-black border border-zinc-700 text-white font-mono text-center tracking-widest text-lg rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Profil ini hanya bisa dibuka oleh orang yang mengetahui 4-digit PIN tersebut.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1.5 text-xs text-red-500 hover:text-red-400 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Profil</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Netflix 1:1 PIN Prompt Modal */}
      <ProfilePinModal
        isOpen={!!pinModalProfile}
        profile={pinModalProfile}
        onSuccess={handlePinSuccess}
        onClose={() => setPinModalProfile(null)}
      />

      {/* Custom Confirmation Modal for Deleting Profile */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Hapus Profil "${editingProfile?.name}"?`}
        message="Riwayat tontonan dan daftar saya pada profil ini akan terhapus secara permanen."
        confirmText="Hapus Profil"
        cancelText="Batal"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={executeDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

