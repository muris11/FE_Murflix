import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { AdminSettingsLayout } from './AdminSettingsLayout';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Server,
  Activity,
  Globe,
  Database,
} from 'lucide-react';

export const AdminGeneralSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setErrorMessage(err.message || 'Gagal memuat konfigurasi');
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
      await adminApi.updateSetting({
        key: 'sansekai_base_url',
        value: settings['sansekai_base_url'] || 'https://api.sansekai.my.id/api',
        description: 'Base URL API Sansekai (DramaBox & ReelShort)',
        is_secret: false,
      });

      setSuccessMessage('Konfigurasi umum berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan konfigurasi');
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

  return (
    <AdminSettingsLayout
      title="Konfigurasi Umum Platform"
      description="Pengaturan integrasi API pihak ketiga (Sansekai Drama), infrastruktur, dan parameter global sistem."
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

        {/* System Overview Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Backend Server</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-white">Golang (Gin Gonic)</p>
            <p className="text-xs text-zinc-500 font-mono">Port 8080 via Cloudflare</p>
          </div>

          <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Database Engine</span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-black text-white">PostgreSQL 16</p>
            <p className="text-xs text-zinc-500 font-mono">127.0.0.1:5432 (murflix)</p>
          </div>

          <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Frontend Stack</span>
              <Globe className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-lg font-black text-white">React 19 + Vite 8</p>
            <p className="text-xs text-zinc-500 font-mono">Tailwind CSS v4</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSave} className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span>Base URL API Sansekai (Drama Asia & ReelShort)</span>
            </label>
            <input
              type="text"
              value={settings['sansekai_base_url'] || 'https://api.sansekai.my.id/api'}
              onChange={(e) => handleChange('sansekai_base_url', e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-xs text-zinc-500">
              Digunakan untuk katalog drama pendek dan konten drama Asia alternatif.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminSettingsLayout>
  );
};
