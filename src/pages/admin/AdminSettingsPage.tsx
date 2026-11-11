import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { SystemSetting } from '@/types/admin';
import { Settings, Save, ShieldCheck, Key, Eye, EyeOff, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [rawSettings, setRawSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        setRawSettings(data || []);
        const map: Record<string, string> = {};
        data?.forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat pengaturan');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Save all changed settings
      for (const [key, value] of Object.entries(settings)) {
        // Find existing to preserve metadata
        const existing = rawSettings.find((s) => s.key === key);
        // Skip if masked token wasn't actually changed
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

      setSuccessMessage('Pengaturan & API keys berhasil disimpan secara aman di PostgreSQL database!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Pengaturan Sistem & API</h1>
        <p className="text-sm text-gray-400 mt-1">
          Kredensial dan API keys disimpan secara aman di database PostgreSQL (bukan file .env statis)
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Security Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black border border-red-500/30 flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <p className="font-bold text-white text-sm mb-1">Proteksi Keamanan API</p>
            Semua token rahasia (seperti TMDB Token) diambil secara dinamis oleh backend Golang dari tabel PostgreSQL{' '}
            <code className="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">system_settings</code>. Frontend tidak
            pernah mengekspos API key ke browser pengguna.
          </div>
        </div>

        {/* TMDB Configuration Card */}
        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">Konfigurasi TMDB (The Movie Database)</h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                TMDB Read Access Token (v4) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
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
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-red-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Dapatkan token dari akun TMDB Anda di: <span className="text-gray-400">Settings &gt; API &gt; API Read Access Token (v4 auth)</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                TMDB Base URL
              </label>
              <input
                type="text"
                value={settings['tmdb_base_url'] || 'https://api.themoviedb.org/3'}
                onChange={(e) => handleChange('tmdb_base_url', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                TMDB Image Base URL (CDN)
              </label>
              <input
                type="text"
                value={settings['tmdb_image_base_url'] || 'https://image.tmdb.org/t/p'}
                onChange={(e) => handleChange('tmdb_image_base_url', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Sansekai API Card */}
        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-white">Konfigurasi Sansekai API (DramaBox & Anime)</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Sansekai API Base URL
            </label>
            <input
              type="text"
              value={settings['sansekai_base_url'] || 'https://api.sansekai.my.id/api'}
              onChange={(e) => handleChange('sansekai_base_url', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Streaming Servers Configuration */}
        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Daftar Server Embed Video Player (JSON)</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Konfigurasi Server Player (VidLink, VidSrc, Embed.su, dll.)
            </label>
            <textarea
              rows={8}
              value={settings['streaming_servers'] || ''}
              onChange={(e) => handleChange('streaming_servers', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-red-500 leading-relaxed"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Format JSON array dengan field: <code className="text-gray-400">id, name, description, type, movieUrl, tvUrl</code>
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan ke Database...' : 'Simpan Pengaturan ke Database'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
