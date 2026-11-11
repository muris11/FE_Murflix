import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { User } from '@/types/auth';
import { AdminSettingsLayout } from './AdminSettingsLayout';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';

export const AdminDemoSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDemoPassword, setShowDemoPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.getSettings(), adminApi.listUsers()])
      .then(([settingsData, usersData]) => {
        const map: Record<string, string> = {};
        (settingsData || []).forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
        setUsers(usersData || []);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat pengaturan akun demo');
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
        demo_account_button_text: prev.demo_account_button_text || `Masuk Cepat sebagai ${selected.full_name || 'Demo User'}`,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const demoKeys = [
        'demo_account_enabled',
        'demo_account_email',
        'demo_account_password',
        'demo_account_button_text',
      ];

      for (const key of demoKeys) {
        await adminApi.updateSetting({
          key,
          value: settings[key] || '',
          description: `Konfigurasi ${key}`,
          is_secret: key.includes('password'),
        });
      }

      setSuccessMessage('Pengaturan Akun Demo berhasil disimpan!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan akun demo');
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

  const isEnabled = settings['demo_account_enabled'] === 'true';

  return (
    <AdminSettingsLayout
      title="Akun Demo & Quick Login"
      description="Konfigurasi tombol one-click login akun demo di halaman masuk (/login) untuk mempermudah calon pelanggan mencoba layanan."
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

        <form onSubmit={handleSave} className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          {/* Toggle Enable Demo */}
          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800">
            <div>
              <p className="text-sm font-bold text-white">Aktifkan Tombol Masuk Akun Demo</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Jika diaktifkan, tombol masuk cepat demo akan muncul di bawah form login utama.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('demo_account_enabled', isEnabled ? 'false' : 'true')}
              className="text-white focus:outline-none transition-transform hover:scale-105"
            >
              {isEnabled ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-zinc-600" />
              )}
            </button>
          </div>

          {/* Quick Select From Existing Users */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-red-500" />
              <span>Pilih Cepat dari Pengguna Aktif</span>
            </label>
            <select
              onChange={(e) => handleSelectUserAsDemo(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">-- Pilih salah satu pengguna sebagai akun demo --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || 'Tanpa Nama'} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">
              Memilih pengguna di sini akan otomatis mengisi email ke form di bawah ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white">Email Akun Demo</label>
              <input
                type="email"
                value={settings['demo_account_email'] || ''}
                onChange={(e) => handleChange('demo_account_email', e.target.value)}
                placeholder="demo@murflix.com"
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white">Password Akun Demo</label>
              <div className="relative">
                <input
                  type={showDemoPassword ? 'text' : 'password'}
                  value={settings['demo_account_password'] || ''}
                  onChange={(e) => handleChange('demo_account_password', e.target.value)}
                  placeholder="Password akun demo"
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 pr-12 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowDemoPassword(!showDemoPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showDemoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">Teks Tombol Demo pada Halaman Login</label>
            <input
              type="text"
              value={settings['demo_account_button_text'] || 'Masuk Cepat dengan Akun Demo'}
              onChange={(e) => handleChange('demo_account_button_text', e.target.value)}
              placeholder="Masuk Cepat dengan Akun Demo"
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700/60 transition-colors"
            >
              <Save className="w-4 h-4 text-zinc-400" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Akun Demo'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminSettingsLayout>
  );
};

