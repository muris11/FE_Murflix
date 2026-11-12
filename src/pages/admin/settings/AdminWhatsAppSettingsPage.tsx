import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { AdminSettingsLayout } from './AdminSettingsLayout';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Info,
  Phone,
  FileText,
} from 'lucide-react';

export const AdminWhatsAppSettingsPage: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [number, setNumber] = useState('');
  const [template, setTemplate] = useState('');
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

        setEnabled(map['whatsapp_enabled'] !== 'false');
        setNumber(map['whatsapp_number'] || '6281234567890');
        setTemplate(
          map['whatsapp_message_template'] ||
            'Halo Admin Murflix, saya ingin berlangganan paket *{plan_name}* seharga *{price}* ({duration}). Mohon info cara pembayarannya. Terima kasih.'
        );
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat konfigurasi WhatsApp');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await Promise.all([
        adminApi.updateSetting({
          key: 'whatsapp_enabled',
          value: enabled ? 'true' : 'false',
          description: 'Status tombol WhatsApp pemesanan paket',
          is_secret: false,
        }),
        adminApi.updateSetting({
          key: 'whatsapp_number',
          value: number.trim(),
          description: 'Nomor WhatsApp admin pemesanan',
          is_secret: false,
        }),
        adminApi.updateSetting({
          key: 'whatsapp_message_template',
          value: template.trim(),
          description: 'Template pesan dinamis WhatsApp',
          is_secret: false,
        }),
      ]);

      setSuccessMessage('Pengaturan WhatsApp berhasil disimpan dan aktif secara langsung!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan konfigurasi WhatsApp');
    } finally {
      setIsSaving(false);
    }
  };

  const samplePlan = {
    name: 'Lifetime / Selamanya',
    price: 'Rp 50.000',
    duration: 'Selamanya',
  };

  const getSimulatedMessage = () => {
    return template
      .replace(/{plan_name}/gi, samplePlan.name)
      .replace(/{price}/gi, samplePlan.price)
      .replace(/{duration}/gi, samplePlan.duration);
  };

  const cleanNumber = number.replace(/[^0-9]/g, '');
  const testUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(getSimulatedMessage())}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AdminSettingsLayout
      title="Integrasi WhatsApp & Pemesanan Paket"
      description="Konfigurasi nomor kontak dan format template pesan otomatis ketika pengunjung mengklik paket langganan."
    >
      <div className="space-y-6">
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Card */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            
            {/* Toggle Activation */}
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80">
              <div className="space-y-1 pr-4">
                <label className="text-sm font-semibold text-white cursor-pointer" htmlFor="wa-toggle">
                  Aktifkan Tombol WhatsApp pada Paket Langganan
                </label>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bila aktif, pengunjung yang memilih paket di landing page akan langsung diarahkan ke chat WhatsApp dengan draf pesan otomatis. Bila nonaktif, pengunjung diarahkan ke halaman login biasa.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  id="wa-toggle"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Target Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Nomor WhatsApp Tujuan Admin</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                Gunakan kode negara (62 untuk Indonesia) tanpa tanda plus (+), spasi, atau tanda minus (-). Contoh format benar: 6281234567890.
              </p>
            </div>

            {/* Message Template */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Format Template Pesan Otomatis</span>
              </label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
                className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 leading-relaxed font-sans"
                placeholder="Tuliskan format template pesan..."
                required
              />

              {/* Placeholder Helper */}
              <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300">
                  <Info className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Variabel Tag Dinamis yang Tersedia:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                    <code className="text-emerald-400 font-mono text-[11px]">{`{plan_name}`}</code>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Nama paket langganan</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                    <code className="text-emerald-400 font-mono text-[11px]">{`{price}`}</code>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Harga paket format Rp</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2">
                    <code className="text-emerald-400 font-mono text-[11px]">{`{duration}`}</code>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Masa aktif paket</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Realistic WhatsApp Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Simulasi Tampilan Pesan WhatsApp (Real-time Preview)</span>
                <span className="text-[11px] text-zinc-500 font-normal">Contoh Paket: {samplePlan.name}</span>
              </label>

              <div className="bg-[#0b141a] border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
                <div className="max-w-md ml-auto bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none p-3.5 text-xs shadow-md space-y-1.5">
                  <p className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                    {getSimulatedMessage()}
                  </p>
                  <div className="text-[10px] text-zinc-300/80 text-right font-mono">
                    Baru saja &middot; Terkirim
                  </div>
                </div>
              </div>
            </div>

            {/* Test Link Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
              <a
                href={testUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-xs text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-zinc-800/70 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uji Coba Tautan WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 ml-1" />
              </a>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-md shadow-red-600/30"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminSettingsLayout>
  );
};
