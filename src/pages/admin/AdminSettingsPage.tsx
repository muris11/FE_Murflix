import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { SystemSetting } from '@/types/admin';
import { User } from '@/types/auth';
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
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Tv,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'demo'>('api');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [rawSettings, setRawSettings] = useState<SystemSetting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showDemoPassword, setShowDemoPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setSuccessMessage('Pengaturan & Akun Demo berhasil disimpan secara aman di database PostgreSQL!');
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
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Settings className="w-7 h-7 text-[#e50914]" />
            <span>Pengaturan Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Konfigurasi TMDB, daftar server streaming, dan pengaturan akun demo halaman login
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'api'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>TMDB & Player</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'demo'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
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
        
        {/* ================= TAB 1: TMDB & SERVERS ================= */}
        {activeTab === 'api' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Security Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black border border-red-500/30 flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <p className="font-bold text-white text-sm mb-1">Proteksi Keamanan API</p>
                Semua token rahasia (seperti TMDB Read Token) tersimpan aman di tabel PostgreSQL{' '}
                <code className="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded">system_settings</code>. Backend Golang
                menyediakan proxy gambar agar pengguna tidak mengalami DNS blocking TMDB.
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

            {/* Streaming Servers Configuration */}
            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Tv className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base sm:text-lg font-bold text-white">Daftar Server Embed Video Player (JSON)</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Konfigurasi Server Player (VidLink, VidSrc, Embed.su, dll.)
                </label>
                <textarea
                  rows={7}
                  value={settings['streaming_servers'] || ''}
                  onChange={(e) => handleChange('streaming_servers', e.target.value)}
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DEMO ACCOUNT & LOGIN ================= */}
        {activeTab === 'demo' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black border border-amber-500/30 flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
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

              {/* User Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Pilih User yang Dijadikan Akun Demo (Otomatis Isi Email)
                </label>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-zinc-400" />
                  <select
                    onChange={(e) => handleSelectUserAsDemo(e.target.value)}
                    className="flex-1 bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="">-- Pilih dari daftar pengguna terdaftar --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || 'Tanpa Nama'} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email & Password Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Password Akun Demo <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDemoPassword(!showDemoPassword)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                    >
                      {showDemoPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showDemoPassword ? 'text' : 'password'}
                    value={settings['demo_account_password'] || ''}
                    onChange={(e) => handleChange('demo_account_password', e.target.value)}
                    placeholder="Masukkan password akun demo"
                    className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Button Label Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Label Teks Tombol di Halaman Login
                </label>
                <input
                  type="text"
                  value={settings['demo_account_button_text'] || 'Masuk dengan Akun Demo (1-Click)'}
                  onChange={(e) => handleChange('demo_account_button_text', e.target.value)}
                  placeholder="Masuk dengan Akun Demo (1-Click)"
                  className="w-full bg-[#1b1b1f] border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Preview Box */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400 font-semibold block mb-2">
                  Preview Tombol pada Halaman Login:
                </span>
                <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 max-w-sm mx-auto text-center space-y-2">
                  <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{settings['demo_account_button_text'] || 'Masuk dengan Akun Demo (1-Click)'}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Status: {isDemoEnabled ? '🟢 Muncul di /login' : '🔴 Tidak ditampilkan'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
