import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { moviesApi } from '@/api/movies';
import { SystemSetting } from '@/types/admin';
import { User } from '@/types/auth';
import { StreamingServer } from '@/types/tmdb';
import { DEFAULT_STREAMING_SERVERS, formatEmbedUrl } from '@/constants/streamingServers';
import {
  Settings,
  Save,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Tv,
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
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'servers' | 'tmdb' | 'demo'>('servers');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [rawSettings, setRawSettings] = useState<SystemSetting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showDemoPassword, setShowDemoPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Streaming Servers state
  const [servers, setServers] = useState<StreamingServer[]>(DEFAULT_STREAMING_SERVERS);
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

  useEffect(() => {
    Promise.all([
      adminApi.getSettings().catch(() => []),
      adminApi.listUsers().catch(() => []),
    ])
      .then(([settingsData, usersData]) => {
        setRawSettings(settingsData || []);
        const map: Record<string, string> = {};
        (settingsData || []).forEach((s: SystemSetting) => {
          map[s.key] = s.value;
        });
        setSettings(map);
        setUsers(usersData || []);

        // Parse streaming servers
        if (map['streaming_servers']) {
          try {
            const parsed = JSON.parse(map['streaming_servers']);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServers(parsed);
              setRawJsonText(JSON.stringify(parsed, null, 2));
            } else {
              setServers(DEFAULT_STREAMING_SERVERS);
              setRawJsonText(JSON.stringify(DEFAULT_STREAMING_SERVERS, null, 2));
            }
          } catch {
            setServers(DEFAULT_STREAMING_SERVERS);
            setRawJsonText(JSON.stringify(DEFAULT_STREAMING_SERVERS, null, 2));
          }
        } else {
          setServers(DEFAULT_STREAMING_SERVERS);
          setRawJsonText(JSON.stringify(DEFAULT_STREAMING_SERVERS, null, 2));
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat pengaturan');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectUserAsDemo = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      setSettings((prev) => ({
        ...prev,
        demo_account_email: selected.email,
        demo_account_button_text: prev.demo_account_button_text || `Masuk sebagai ${selected.full_name || 'Demo User'}`,
      }));
    }
  };

  // Sync servers to settings map
  const syncServersToSettings = (newServers: StreamingServer[]) => {
    setServers(newServers);
    const jsonStr = JSON.stringify(newServers, null, 2);
    setRawJsonText(jsonStr);
    handleChange('streaming_servers', jsonStr);
  };

  // Reorder Server
  const handleMoveServer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= servers.length) return;

    const updated = [...servers];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    syncServersToSettings(updated);
  };

  // Delete Server
  const handleDeleteServer = (index: number) => {
    const s = servers[index];
    if (!window.confirm(`Hapus server embed "${s.name}"?`)) return;
    const updated = servers.filter((_, i) => i !== index);
    syncServersToSettings(updated);
  };

  // Open Modal Add
  const openAddServerModal = () => {
    setEditingServerIndex(null);
    setServerFormData({
      id: '',
      name: '',
      description: 'Zero Ads, HD',
      type: 'iframe',
      movieUrl: 'https://',
      tvUrl: 'https://',
    });
    setIsServerModalOpen(true);
  };

  // Open Modal Edit
  const openEditServerModal = (index: number) => {
    setEditingServerIndex(index);
    setServerFormData({ ...servers[index] });
    setIsServerModalOpen(true);
  };

  // Save Modal Server
  const handleSaveServerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverFormData.id.trim() || !serverFormData.name.trim() || !serverFormData.movieUrl.trim() || !serverFormData.tvUrl.trim()) {
      alert('Semua kolom server wajib diisi!');
      return;
    }

    const cleanServer: StreamingServer = {
      ...serverFormData,
      id: serverFormData.id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''),
      name: serverFormData.name.trim(),
      description: serverFormData.description.trim(),
      movieUrl: serverFormData.movieUrl.trim(),
      tvUrl: serverFormData.tvUrl.trim(),
      type: 'iframe',
    };

    let updated: StreamingServer[];
    if (editingServerIndex !== null) {
      updated = [...servers];
      updated[editingServerIndex] = cleanServer;
    } else {
      updated = [...servers, cleanServer];
    }

    syncServersToSettings(updated);
    setIsServerModalOpen(false);
  };

  // Reset to default ad-free list
  const handleResetServers = () => {
    if (!window.confirm('Kembalikan konfigurasi player ke 8 server Ad-Free rekomendasi default?')) {
      return;
    }
    syncServersToSettings(DEFAULT_STREAMING_SERVERS);
  };

  // Apply raw JSON changes
  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (Array.isArray(parsed)) {
        syncServersToSettings(parsed);
        alert('Format JSON valid dan server berhasil diperbarui!');
      } else {
        alert('Format JSON harus berupa Array object server!');
      }
    } catch (err: any) {
      alert(`Format JSON tidak valid: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Save all settings to DB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      for (const [key, value] of Object.entries(settings)) {
        const existing = rawSettings.find((s) => s.key === key);
        if (existing?.is_secret && value.includes('••••••••')) {
          continue;
        }

        await adminApi.updateSetting({
          key,
          value,
          description: existing?.description,
          is_secret: existing?.is_secret || false,
        });
      }

      moviesApi.clearCache('streaming_servers');
      setSuccessMessage('Pengaturan server streaming dan sistem berhasil disimpan secara dinamis di database PostgreSQL!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isDemoEnabled = settings['demo_account_enabled'] === 'true';

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Settings className="w-7 h-7 text-[#e50914]" />
            <span>Pengaturan Sistem & Server Player</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Kelola daftar server streaming ad-free secara dinamis, konfigurasi TMDB, dan akses akun demo
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('servers')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'servers'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Server Player ({servers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tmdb')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'tmdb'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>TMDB & API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'demo'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Akun Demo Login</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-sm shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm shadow-md animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ================================================================= */}
        {/* TAB 1: DYNAMIC STREAMING SERVERS MANAGEMENT                       */}
        {/* ================================================================= */}
        {activeTab === 'servers' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Toolbar */}
            <div className="p-5 rounded-2xl bg-[#151518] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-black text-white">Daftar Server Embed Player Dinamis</h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold">
                    {servers.length} Aktif
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Server urutan <strong className="text-white">#1</strong> otomatis menjadi pemutar utama (default) saat pengguna membuka video. Urutan dapat digeser ke atas / ke bawah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openAddServerModal}
                  className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Server Baru</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetServers}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
                  title="Kembalikan ke 8 server Ad-Free rekomendasi default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    showRawJson
                      ? 'bg-zinc-700 border-zinc-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title="Lihat / Edit format JSON mentah"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showRawJson ? 'Tutup JSON' : 'Editor JSON'}</span>
                </button>
              </div>
            </div>

            {/* Placeholder Format Legend */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
              <p className="font-bold text-white flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Panduan Placeholder Format URL:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-red-400 font-bold">&#123;id&#125;</span> atau <span className="text-red-400 font-bold">&#123;tmdb_id&#125;</span>
                  <p className="text-zinc-500 text-[10px] font-sans mt-0.5">TMDB ID Film / Serial</p>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-amber-400 font-bold">&#123;s&#125;</span> atau <span className="text-amber-400 font-bold">&#123;season&#125;</span>
                  <p className="text-zinc-500 text-[10px] font-sans mt-0.5">Nomor Musim TV (contoh: 1)</p>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-emerald-400 font-bold">&#123;e&#125;</span> atau <span className="text-emerald-400 font-bold">&#123;episode&#125;</span>
                  <p className="text-zinc-500 text-[10px] font-sans mt-0.5">Nomor Episode TV (contoh: 1)</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                Catatan khusus Stellar: TV URL menggunakan format tanda hubung <code className="text-zinc-300">/tv/&#123;id&#125;-&#123;s&#125;-&#123;e&#125;</code>.
              </p>
            </div>

            {/* Raw JSON Editor Panel (Collapsible) */}
            {showRawJson && (
              <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 space-y-3 animate-fadeIn shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Editor Mentah JSON Server
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyRawJson}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Terapkan JSON
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  className="w-full bg-[#101012] border border-zinc-700 text-white rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>
            )}

            {/* Server Cards List */}
            <div className="space-y-3">
              {servers.map((s, index) => {
                const isDefault = index === 0;

                return (
                  <div
                    key={`${s.id}-${index}`}
                    className={`bg-[#18181b] rounded-2xl border p-4 sm:p-5 transition-all shadow-md hover:border-zinc-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isDefault
                        ? 'border-red-600/50 bg-gradient-to-r from-red-950/20 to-[#18181b]'
                        : 'border-zinc-800'
                    }`}
                  >
                    {/* Left: Reorder Controls & Badges */}
                    <div className="flex items-start sm:items-center space-x-3.5">
                      
                      {/* Up/Down buttons */}
                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => handleMoveServer(index, 'up')}
                          disabled={index === 0}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Geser ke atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveServer(index, 'down')}
                          disabled={index === servers.length - 1}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Geser ke bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Rank & Server Info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isDefault
                                ? 'bg-red-600 text-white shadow-sm shadow-red-600/50'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {isDefault ? '#1 Utama (Default)' : `#${index + 1}`}
                          </span>
                          <h4 className="text-base font-extrabold text-white">{s.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-semibold border border-white/5">
                            {s.description}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            id: {s.id}
                          </span>
                        </div>

                        {/* URL Templates */}
                        <div className="space-y-1 mt-2 text-xs font-mono">
                          <div className="flex items-center space-x-2 text-zinc-400">
                            <span className="w-12 text-[10px] font-bold uppercase text-zinc-500">Film:</span>
                            <span className="text-zinc-200 truncate max-w-sm sm:max-w-md md:max-w-xl select-all">
                              {s.movieUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(s.movieUrl)}
                              className="text-zinc-500 hover:text-white transition-colors"
                              title="Salin template URL film"
                            >
                              {copiedUrl === s.movieUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 text-zinc-400">
                            <span className="w-12 text-[10px] font-bold uppercase text-zinc-500">Serial:</span>
                            <span className="text-zinc-200 truncate max-w-sm sm:max-w-md md:max-w-xl select-all">
                              {s.tvUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(s.tvUrl)}
                              className="text-zinc-500 hover:text-white transition-colors"
                              title="Salin template URL serial"
                            >
                              {copiedUrl === s.tvUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => openEditServerModal(index)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all border border-zinc-700 flex items-center space-x-1"
                        title="Edit server ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteServer(index)}
                        className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
                        title="Hapus server ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: TMDB CONFIGURATION                                         */}
        {/* ================================================================= */}
        {activeTab === 'tmdb' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Security Banner */}
            <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <p className="font-bold text-white text-sm mb-1">Proteksi Keamanan API</p>
                Semua token rahasia tersimpan aman di database PostgreSQL tabel{' '}
                <code className="text-zinc-300 font-mono text-xs border border-zinc-700 px-1.5 py-0.5 rounded">system_settings</code>.
                Katalog film dimuat langsung melalui edge CDN TMDB untuk performa ultra-ringan.
              </div>
            </div>

            {/* TMDB Configuration Card */}
            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Key className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-white">Konfigurasi The Movie Database (TMDB)</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    TMDB Read Access Token (v4) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showToken ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={settings['tmdb_access_token'] || ''}
                  onChange={(e) => handleChange('tmdb_access_token', e.target.value)}
                  placeholder="Masukkan TMDB Read Access Token (eyJhbGciOi...)"
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    TMDB Base URL
                  </label>
                  <input
                    type="text"
                    value={settings['tmdb_base_url'] || 'https://api.themoviedb.org/3'}
                    onChange={(e) => handleChange('tmdb_base_url', e.target.value)}
                    className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    TMDB Image CDN Base URL
                  </label>
                  <input
                    type="text"
                    value={settings['tmdb_image_base_url'] || 'https://image.tmdb.org/t/p'}
                    onChange={(e) => handleChange('tmdb_image_base_url', e.target.value)}
                    className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DEMO ACCOUNT & LOGIN                                       */}
        {/* ================================================================= */}
        {activeTab === 'demo' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Info Card */}
            <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <p className="font-bold text-white text-sm mb-1">Pengaturan Akun Demo 1-Click Login</p>
                Ketika diaktifkan, tombol demo akan muncul di halaman login (`/login`). Pengunjung atau reviewer cukup
                klik 1x tombol tersebut untuk otomatis login dan langsung menonton tanpa repot mengetik password.
              </div>
            </div>

            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
              
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1b1b1f] border border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Aktifkan Tombol Akun Demo di Login</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isDemoEnabled
                      ? 'Tombol akun demo aktif dan ditampilkan di halaman login'
                      : 'Tombol akun demo disembunyikan dari halaman login'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleChange('demo_account_enabled', isDemoEnabled ? 'false' : 'true')}
                  className="text-2xl transition-transform hover:scale-105"
                >
                  {isDemoEnabled ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-600" />
                  )}
                </button>
              </div>

              {isDemoEnabled && (
                <div className="space-y-4 pt-2 animate-fadeIn">
                  
                  {/* Select from existing users */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Pilih Akun Demo dari Daftar Pengguna
                    </label>
                    <select
                      onChange={(e) => handleSelectUserAsDemo(e.target.value)}
                      className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="">-- Pilih akun pengguna aktif --</option>
                      {users
                        .filter((u) => u.is_active)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || 'Tanpa Nama'} ({u.email}) - Paket: {u.plan_name || 'Free'}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                        Email Akun Demo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={settings['demo_account_email'] || ''}
                        onChange={(e) => handleChange('demo_account_email', e.target.value)}
                        placeholder="demo@murflix.com"
                        className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                          Password Akun Demo <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDemoPassword(!showDemoPassword)}
                          className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                        >
                          {showDemoPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showDemoPassword ? 'Sembunyikan' : 'Lihat'}</span>
                        </button>
                      </div>
                      <input
                        type={showDemoPassword ? 'text' : 'password'}
                        value={settings['demo_account_password'] || ''}
                        onChange={(e) => handleChange('demo_account_password', e.target.value)}
                        placeholder="Password akun demo"
                        className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                      Label Teks Tombol Demo
                    </label>
                    <input
                      type="text"
                      value={settings['demo_account_button_text'] || 'Masuk Cepat dengan Akun Demo'}
                      onChange={(e) => handleChange('demo_account_button_text', e.target.value)}
                      placeholder="Masuk Cepat dengan Akun Demo"
                      className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Save Button */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xl shadow-red-600/30 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* =================================================================== */}
      {/* MODAL: TAMBAH / EDIT STREAMING SERVER                               */}
      {/* =================================================================== */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsServerModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
                <Tv className="w-5 h-5 text-[#e50914]" />
                <span>{editingServerIndex !== null ? 'Edit Server Streaming' : 'Tambah Server Embed Baru'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Konfigurasi template URL embed video player film dan serial TV
              </p>
            </div>

            <form onSubmit={handleSaveServerForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Nama Server <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serverFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setServerFormData((prev) => ({
                        ...prev,
                        name,
                        id: editingServerIndex === null && !prev.id ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : prev.id,
                      }));
                    }}
                    placeholder="Contoh: EmbedWave"
                    className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    ID Unik (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serverFormData.id}
                    onChange={(e) => setServerFormData({ ...serverFormData, id: e.target.value })}
                    placeholder="Contoh: embedwave"
                    className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Deskripsi / Label Fitur
                </label>
                <input
                  type="text"
                  value={serverFormData.description}
                  onChange={(e) => setServerFormData({ ...serverFormData, description: e.target.value })}
                  placeholder="Contoh: Zero Ads, 4K HDR, Multi-Sub"
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Movie URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Format URL Film <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-1 text-[10px]">
                    <span className="text-zinc-500">Insert:</span>
                    <button
                      type="button"
                      onClick={() => setServerFormData((prev) => ({ ...prev, movieUrl: `${prev.movieUrl}{id}` }))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400 font-mono"
                    >
                      + &#123;id&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerFormData((prev) => ({ ...prev, movieUrl: `${prev.movieUrl}{tmdb_id}` }))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400 font-mono"
                    >
                      + &#123;tmdb_id&#125;
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={serverFormData.movieUrl}
                  onChange={(e) => setServerFormData({ ...serverFormData, movieUrl: e.target.value })}
                  placeholder="https://embedwave.cc/embed/movie/{id}"
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* TV URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Format URL Serial TV <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-1 text-[10px]">
                    <span className="text-zinc-500">Insert:</span>
                    <button
                      type="button"
                      onClick={() => setServerFormData((prev) => ({ ...prev, tvUrl: `${prev.tvUrl}/{id}/{s}/{e}` }))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono"
                    >
                      + /&#123;id&#125;/&#123;s&#125;/&#123;e&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerFormData((prev) => ({ ...prev, tvUrl: `${prev.tvUrl}/{id}-{s}-{e}` }))}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono"
                    >
                      + /&#123;id&#125;-&#123;s&#125;-&#123;e&#125;
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={serverFormData.tvUrl}
                  onChange={(e) => setServerFormData({ ...serverFormData, tvUrl: e.target.value })}
                  placeholder="https://embedwave.cc/embed/tv/{id}/{s}/{e}"
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Live Preview Test */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1 text-[11px] font-mono">
                <p className="text-zinc-500 font-sans text-[10px] uppercase font-bold">Simulasi Hasil Embed (ID: 11174, S1 E1):</p>
                <p className="text-zinc-300 truncate">
                  Film: <span className="text-red-400">{formatEmbedUrl(serverFormData.movieUrl, 11174)}</span>
                </p>
                <p className="text-zinc-300 truncate">
                  Serial: <span className="text-amber-400">{formatEmbedUrl(serverFormData.tvUrl, 78292, 1, 1)}</span>
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsServerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                >
                  Simpan Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
