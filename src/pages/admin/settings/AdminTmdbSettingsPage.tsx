import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { moviesApi } from '@/api/movies';
import { AdminSettingsLayout } from './AdminSettingsLayout';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Film,
  ExternalLink,
} from 'lucide-react';

export const AdminTmdbSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({
    status: 'idle',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((settingsData) => {
        const map: Record<string, string> = {};
        (settingsData || []).forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat pengaturan TMDB');
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
      // 1. Save Token
      if (settings['tmdb_access_token']) {
        await adminApi.updateSetting({
          key: 'tmdb_access_token',
          value: settings['tmdb_access_token'],
          description: 'TMDB API v4 Read Access Token (Dikelola via Admin UI)',
          is_secret: true,
        });
      }

      // 2. Save Base URL
      await adminApi.updateSetting({
        key: 'tmdb_base_url',
        value: settings['tmdb_base_url'] || 'https://api.themoviedb.org/3',
        description: 'Base URL API TMDB',
        is_secret: false,
      });

      // 3. Save Image Base URL
      await adminApi.updateSetting({
        key: 'tmdb_image_base_url',
        value: settings['tmdb_image_base_url'] || 'https://image.tmdb.org/t/p',
        description: 'Base URL Image CDN TMDB',
        is_secret: false,
      });

      setSuccessMessage('Pengaturan TMDB API & Media CDN berhasil disimpan!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan TMDB');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      const res = await moviesApi.getTrending('movie', 'day');
      if (res && res.results && res.results.length > 0) {
        setTestResult({
          status: 'success',
          message: `Koneksi berhasil! Menerima ${res.results.length} film trending dari TMDB.`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Respons dari TMDB kosong atau format tidak sesuai.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Gagal menghubungi API TMDB. Periksa token Anda.',
      });
    }
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
      title="API TMDB & Media CDN"
      description="Kelola API Read Access Token v4 dan CDN gambar TMDB untuk katalog film, serial, sinopsis, dan poster."
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

        {/* Security Banner */}
        <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-5 flex items-start space-x-3.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Database Protected Configuration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Token TMDB disimpan di database PostgreSQL pada tabel <code className="text-zinc-300">system_settings</code> dengan enkripsi. Server secara otomatis memuat token saat booting tanpa memerlukan restart file environment.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSave} className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          {/* TMDB Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-red-500" />
                <span>TMDB API Read Access Token (v4 auth)</span>
              </label>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-red-500 hover:text-red-400 flex items-center space-x-1"
              >
                <span>Dapatkan Token di TMDB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={settings['tmdb_access_token'] || ''}
                onChange={(e) => handleChange('tmdb_access_token', e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-red-500 pr-12 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Gunakan API Read Access Token (panjang berformat JWT), bukan API Key v3 standar.
            </p>
          </div>

          {/* TMDB Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">Base URL API TMDB</label>
            <input
              type="text"
              value={settings['tmdb_base_url'] || 'https://api.themoviedb.org/3'}
              onChange={(e) => handleChange('tmdb_base_url', e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Image Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">TMDB Image CDN URL</label>
            <input
              type="text"
              value={settings['tmdb_image_base_url'] || 'https://image.tmdb.org/t/p'}
              onChange={(e) => handleChange('tmdb_image_base_url', e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Action buttons & test connection */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={testConnection}
              disabled={testResult.status === 'testing'}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
            >
              <Film className="w-4 h-4 text-red-500" />
              <span>{testResult.status === 'testing' ? 'Menguji API...' : 'Uji Koneksi TMDB Sekarang'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan TMDB'}</span>
            </button>
          </div>

          {/* Test connection result message */}
          {testResult.status === 'success' && (
            <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 p-3.5 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}
          {testResult.status === 'error' && (
            <div className="flex items-center space-x-2 bg-rose-950/60 border border-rose-500/50 text-rose-400 p-3.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}
        </form>
      </div>
    </AdminSettingsLayout>
  );
};

