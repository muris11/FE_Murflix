import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { StreamingServer } from '@/types/tmdb';
import { DEFAULT_STREAMING_SERVERS, formatEmbedUrl } from '@/constants/streamingServers';
import { AdminSettingsLayout } from './AdminSettingsLayout';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Code2,
  Check,
  Copy,
  X,
  ExternalLink,
  Film,
  Layers,
  Tv,
} from 'lucide-react';

export const AdminServersSettingsPage: React.FC = () => {
  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_STREAMING_SERVERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal and JSON states
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [editingServerIndex, setEditingServerIndex] = useState<number | null>(null);
  const [serverFormData, setServerFormData] = useState<StreamingServer>({
    id: '',
    name: '',
    description: '',
    type: 'iframe',
    movieUrl: '',
    tvUrl: '',
  });
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [serverToDeleteIndex, setServerToDeleteIndex] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((settingsData) => {
        const found = settingsData.find((s) => s.key === 'streaming_servers');
        if (found && found.value) {
          try {
            const parsed = JSON.parse(found.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServers(parsed);
              setRawJsonText(JSON.stringify(parsed, null, 2));
              return;
            }
          } catch {}
        }
        setServers(DEFAULT_STREAMING_SERVERS);
        setRawJsonText(JSON.stringify(DEFAULT_STREAMING_SERVERS, null, 2));
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat daftar server');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveServersToBackend = async (serversToSave: StreamingServer[]) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const jsonValue = JSON.stringify(serversToSave);
      await adminApi.updateSetting({
        key: 'streaming_servers',
        value: jsonValue,
        description: 'Daftar server embed streaming untuk video player',
        is_secret: false,
      });
      setSuccessMessage('Daftar server streaming berhasil disimpan ke database!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan server ke database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingServerIndex(null);
    setServerFormData({
      id: '',
      name: '',
      description: 'Zero Ads, HD',
      type: 'iframe',
      movieUrl: 'https://example.com/embed/movie/{id}',
      tvUrl: 'https://example.com/embed/tv/{id}/{s}/{e}',
    });
    setIsServerModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingServerIndex(index);
    setServerFormData({ ...servers[index] });
    setIsServerModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverFormData.id.trim() || !serverFormData.name.trim() || !serverFormData.movieUrl.trim()) {
      setErrorMessage('ID Server, Nama, dan Format URL Film wajib diisi');
      return;
    }

    const cleanData: StreamingServer = {
      ...serverFormData,
      id: serverFormData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      name: serverFormData.name.trim(),
      description: serverFormData.description?.trim(),
      movieUrl: serverFormData.movieUrl.trim(),
      tvUrl: serverFormData.tvUrl?.trim(),
    };

    let updatedList: StreamingServer[];
    if (editingServerIndex !== null) {
      updatedList = [...servers];
      updatedList[editingServerIndex] = cleanData;
    } else {
      updatedList = [...servers, cleanData];
    }

    setServers(updatedList);
    setRawJsonText(JSON.stringify(updatedList, null, 2));
    setIsServerModalOpen(false);
    saveServersToBackend(updatedList);
  };

  const executeDeleteServer = () => {
    if (serverToDeleteIndex === null) return;
    const updated = servers.filter((_, i) => i !== serverToDeleteIndex);
    setServers(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    saveServersToBackend(updated);
    setServerToDeleteIndex(null);
  };

  const handleMoveServer = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === servers.length - 1)) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...servers];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setServers(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    saveServersToBackend(updated);
  };

  const executeResetToDefaults = () => {
    setServers(DEFAULT_STREAMING_SERVERS);
    setRawJsonText(JSON.stringify(DEFAULT_STREAMING_SERVERS, null, 2));
    saveServersToBackend(DEFAULT_STREAMING_SERVERS);
    setShowResetConfirm(false);
  };

  const handleSaveRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Format JSON harus berupa array [] dari objek StreamingServer');
      }
      for (const item of parsed) {
        if (!item.id || !item.name || !item.movieUrl) {
          throw new Error('Setiap server harus memiliki atribut id, name, dan movieUrl');
        }
      }
      setServers(parsed);
      saveServersToBackend(parsed);
      setShowRawJson(false);
    } catch (err: any) {
      setErrorMessage(`Format JSON Tidak Valid: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AdminSettingsLayout
      title="Server Streaming"
      description="Kelola daftar server pemutar film dan serial TV tanpa hardcode. Perubahan langsung aktif di seluruh video player."
      action={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>{showRawJson ? 'Tutup Editor JSON' : 'Editor Raw JSON'}</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Default</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Tambah Server</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notifications */}
        {successMessage && (
          <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center space-x-2 bg-rose-950/60 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Format Explanation Card */}
        <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Tv className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-white">Panduan Format Template URL</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Total Server: {servers.length}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sistem secara otomatis menggantikan placeholder parameter dinamis saat pengguna menonton:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-black/40 border border-zinc-800 p-2.5 rounded-lg">
              <span className="text-red-400 font-bold">&#123;id&#125;</span> atau <span className="text-red-400 font-bold">&#123;tmdb_id&#125;</span>
              <p className="text-[11px] text-zinc-400 mt-1 font-sans">ID TMDB Film / Serial</p>
            </div>
            <div className="bg-black/40 border border-zinc-800 p-2.5 rounded-lg">
              <span className="text-red-400 font-bold">&#123;s&#125;</span> atau <span className="text-red-400 font-bold">&#123;season&#125;</span>
              <p className="text-[11px] text-zinc-400 mt-1 font-sans">Nomor Season Serial TV</p>
            </div>
            <div className="bg-black/40 border border-zinc-800 p-2.5 rounded-lg">
              <span className="text-red-400 font-bold">&#123;e&#125;</span> atau <span className="text-red-400 font-bold">&#123;episode&#125;</span>
              <p className="text-[11px] text-zinc-400 mt-1 font-sans">Nomor Episode Serial TV</p>
            </div>
            <div className="bg-black/40 border border-zinc-800 p-2.5 rounded-lg">
              <span className="text-amber-400 font-bold">&#123;id&#125;-&#123;s&#125;-&#123;e&#125;</span>
              <p className="text-[11px] text-zinc-400 mt-1 font-sans">Format Hyphen (cth: Stellar)</p>
            </div>
          </div>
        </div>

        {/* Raw JSON View Mode */}
        {showRawJson && (
          <div className="bg-[#121215] border border-zinc-700/80 rounded-2xl p-5 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">Direct Raw JSON Editor</h3>
              </div>
              <span className="text-xs text-zinc-400">Edit langsung array JSON jika ingin bulk import / export</span>
            </div>
            <textarea
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              rows={12}
              className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500 transition-colors"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowRawJson(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRawJson}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Simpan JSON ke Database</span>
              </button>
            </div>
          </div>
        )}

        {/* Server List Cards */}
        <div className="space-y-3">
          {servers.map((server, index) => {
            const isFirst = index === 0;
            const isLast = index === servers.length - 1;
            const isAdFree =
              server.description?.toLowerCase().includes('zero ads') ||
              server.description?.toLowerCase().includes('no ads') ||
              server.description?.toLowerCase().includes('ad-free');

            return (
              <div
                key={server.id + index}
                className="bg-[#141416] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Server details */}
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-300 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{server.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {server.id}
                      </span>
                      {isAdFree && (
                        <span className="text-[11px] font-medium text-emerald-400">
                          Ad-Free
                        </span>
                      )}
                      {server.description && (
                        <span className="text-xs text-zinc-500">({server.description})</span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs font-mono text-zinc-400">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-red-400/80 font-semibold w-12 flex-shrink-0">Movie:</span>
                        <span className="truncate text-zinc-300">{server.movieUrl}</span>
                        <button
                          onClick={() => copyToClipboard(server.movieUrl)}
                          className="text-zinc-500 hover:text-white p-1 rounded"
                          title="Salin template URL"
                        >
                          {copiedUrl === server.movieUrl ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {server.tvUrl && (
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-blue-400/80 font-semibold w-12 flex-shrink-0">TV:</span>
                          <span className="truncate text-zinc-300">{server.tvUrl}</span>
                          <button
                            onClick={() => copyToClipboard(server.tvUrl!)}
                            className="text-zinc-500 hover:text-white p-1 rounded"
                            title="Salin template URL"
                          >
                            {copiedUrl === server.tvUrl ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Reorder & Actions */}
                <div className="flex items-center justify-end space-x-1.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMoveServer(index, 'up')}
                    disabled={isFirst}
                    className={`p-2 rounded-xl border border-zinc-800 transition-colors ${
                      isFirst
                        ? 'text-zinc-600 bg-zinc-900/40 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700'
                    }`}
                    title="Pindahkan ke atas (prioritas lebih tinggi)"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => handleMoveServer(index, 'down')}
                    disabled={isLast}
                    className={`p-2 rounded-xl border border-zinc-800 transition-colors ${
                      isLast
                        ? 'text-zinc-600 bg-zinc-900/40 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700'
                    }`}
                    title="Pindahkan ke bawah"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(index)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                    title="Ubah Konfigurasi Server"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setServerToDeleteIndex(index)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Hapus Server"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Server Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <Tv className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">
                  {editingServerIndex !== null ? 'Ubah Konfigurasi Server' : 'Tambah Server Streaming Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">ID Server (Unik, Huruf Kecil)</label>
                  <input
                    type="text"
                    required
                    placeholder="embedwave"
                    value={serverFormData.id}
                    onChange={(e) => setServerFormData({ ...serverFormData, id: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nama Server</label>
                  <input
                    type="text"
                    required
                    placeholder="EmbedWave"
                    value={serverFormData.name}
                    onChange={(e) => setServerFormData({ ...serverFormData, name: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Deskripsi / Label Fitur</label>
                <input
                  type="text"
                  placeholder="Zero Ads, HD / 4K Ad-Free"
                  value={serverFormData.description || ''}
                  onChange={(e) => setServerFormData({ ...serverFormData, description: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Format URL Film (Gunakan <span className="text-red-400 font-mono">&#123;id&#125;</span>)
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://embedwave.cc/embed/movie/{id}"
                  value={serverFormData.movieUrl}
                  onChange={(e) => setServerFormData({ ...serverFormData, movieUrl: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Format URL Serial TV (Gunakan <span className="text-red-400 font-mono">&#123;id&#125;</span>, <span className="text-red-400 font-mono">&#123;s&#125;</span>, <span className="text-red-400 font-mono">&#123;e&#125;</span>)
                </label>
                <input
                  type="text"
                  placeholder="https://embedwave.cc/embed/tv/{id}/{s}/{e}"
                  value={serverFormData.tvUrl || ''}
                  onChange={(e) => setServerFormData({ ...serverFormData, tvUrl: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsServerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingServerIndex !== null ? 'Perbarui Server' : 'Tambahkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Server Modal */}
      <ConfirmModal
        isOpen={serverToDeleteIndex !== null}
        title={serverToDeleteIndex !== null ? `Hapus Server "${servers[serverToDeleteIndex]?.name}"?` : 'Hapus Server?'}
        message="Server streaming ini akan dihapus dari daftar server aktif."
        confirmText="Hapus Server"
        cancelText="Batal"
        variant="danger"
        onConfirm={executeDeleteServer}
        onClose={() => setServerToDeleteIndex(null)}
      />

      {/* Confirm Reset Default Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset ke Server Bawaan?"
        message="Daftar server akan dikembalikan ke 11 default server resmi (termasuk 8 server ad-free berkecepatan tinggi)."
        confirmText="Reset Sekarang"
        cancelText="Batal"
        variant="warning"
        onConfirm={executeResetToDefaults}
        onClose={() => setShowResetConfirm(false)}
      />
    </AdminSettingsLayout>
  );
};

