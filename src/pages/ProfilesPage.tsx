import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Check, Trash2, Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { UserProfile, NETFLIX_AVATAR_PRESETS } from '@/types/profile';
import { uploadAvatarImage, getAvatarUrl } from '@/utils/avatarConverter';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

export const ProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profiles, activeProfile, selectProfile, refreshProfiles } = useAuth();

  const [isManaging, setIsManaging] = useState(searchParams.get('manage') === 'true');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/avatars/avatar-red.svg');
  const [isKids, setIsKids] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const handleSelect = (profile: UserProfile) => {
    if (isManaging) {
      openEditModal(profile);
      return;
    }
    selectProfile(profile);
    navigate('/');
  };

  const openCreateModal = () => {
    setError(null);
    setProfileName('');
    setSelectedAvatar('/avatars/avatar-blue.svg');
    setIsKids(false);
    setEditingProfile(null);
    setModalMode('create');
  };

  const openEditModal = (profile: UserProfile) => {
    setError(null);
    setProfileName(profile.name);
    setSelectedAvatar(profile.avatar_url || '/avatars/avatar-red.svg');
    setIsKids(profile.is_kids);
    setEditingProfile(profile);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingProfile(null);
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

    setError(null);
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        const created = await profilesApi.createProfile({
          name: profileName.trim(),
          avatar_url: selectedAvatar,
          is_kids: isKids,
        });
        await refreshProfiles();
        selectProfile(created);
        closeModal();
      } else if (modalMode === 'edit' && editingProfile) {
        const updated = await profilesApi.updateProfile(editingProfile.id, {
          name: profileName.trim(),
          avatar_url: selectedAvatar,
          is_kids: isKids,
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

  const handleDelete = async () => {
    if (!editingProfile) return;
    if (!window.confirm(`Hapus profil "${editingProfile.name}"? Riwayat tontonan profil ini akan hilang.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await profilesApi.deleteProfile(editingProfile.id);
      await refreshProfiles();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Gagal menghapus profil');
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
        {activeProfile && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        )}
      </header>

      {/* Main Profiles Center Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-10 animate-fadeIn">
          {isManaging ? 'Kelola Profil' : 'Siapa yang Sedang Menonton?'}
        </h1>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {profiles.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3 animate-pulse">
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl bg-zinc-800 border-2 border-white/10 shadow-2xl" />
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
                <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-transparent group-hover:border-white shadow-2xl transition-all duration-300">
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

                {/* Profile Name */}
                <span className="mt-3 text-sm sm:text-base font-semibold text-gray-400 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[150px]">
                  {p.name}
                </span>
              </div>
            );
          }))}

          {/* Add Profile Card */}
          <div
            onClick={openCreateModal}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl border-2 border-dashed border-zinc-700 group-hover:border-white group-hover:bg-zinc-800/60 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all duration-300 shadow-xl">
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
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="is_kids_toggle" className="text-xs sm:text-sm text-gray-300 cursor-pointer font-medium">
                  Profil Anak? (Hanya menampilkan tontonan ramah keluarga &amp; anak)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1.5 text-xs text-red-500 hover:text-red-400 font-semibold transition-colors disabled:opacity-50"
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
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs font-bold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

