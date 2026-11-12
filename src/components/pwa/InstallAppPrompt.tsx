import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Apple, Check, ExternalLink, Copy } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

/**
 * Trigger PWA Install flow globally from any button (e.g. LandingPage hero CTA).
 * If the browser has a pending native install prompt, it launches immediately.
 * Otherwise, it displays the beautiful custom installation modal.
 */
export const triggerPWAInstallPrompt = async () => {
  const prompt = window.deferredPWAInstallPrompt;
  if (prompt) {
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('murflix_pwa_installed', 'true');
      }
      window.deferredPWAInstallPrompt = null;
      return;
    } catch (err) {
      console.warn('[PWA] Prompt launch error:', err);
    }
  }

  // Open the custom installation modal
  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
};

export const InstallAppPrompt: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check dismissal cooldown
    const dismissedTime = localStorage.getItem('murflix_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // 3. Detect default platform for tab selector
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    // 4. Check if early window prompt is already captured
    if (window.deferredPWAInstallPrompt) {
      setIsInstallable(true);
    }

    // 5. Listen for custom or browser install events
    const handleInstallable = () => setIsInstallable(true);
    const handleOpenModal = () => setShowModal(true);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowModal(false);
      window.deferredPWAInstallPrompt = null;
      localStorage.setItem('murflix_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('murflix-pwa-installable', handleInstallable);
    window.addEventListener('open-pwa-install-modal', handleOpenModal);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('murflix-pwa-installable', handleInstallable);
      window.removeEventListener('open-pwa-install-modal', handleOpenModal);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    const prompt = window.deferredPWAInstallPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowModal(false);
        }
        window.deferredPWAInstallPrompt = null;
        setIsInstallable(false);
      } catch (err) {
        console.warn('[PWA] Native install failed:', err);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('murflix_pwa_dismissed', Date.now().toString());
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Floating Bottom PWA Install Banner (Only when installable and not dismissed) */}
      {!isInstalled && !isDismissed && isInstallable && (
        <aside
          aria-label="Pasang Aplikasi Murflix"
          className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#121215]/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-4 shadow-2xl animate-fadeIn"
        >
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-black p-0.5 flex-shrink-0 shadow-md">
              <img
                src="/icon-192.png"
                alt="Murflix App Icon"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white tracking-tight">
                  Pasang Aplikasi Murflix
                </h4>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="Tutup banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Nonton lancar tanpa browser seperti aplikasi APK langsung dari layar utama perangkat Anda.
              </p>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#e50914] hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* High-End Cinema Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            {/* Header with App Identity */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-black p-0.5 flex-shrink-0 shadow-lg">
                  <img
                    src="/icon-192.png"
                    alt="Murflix Icon"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Pasang Aplikasi Murflix</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Aplikasi Web Mandiri (PWA / Standalone)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benefits Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="block text-[11px] font-bold text-white">Bebas Browser</span>
                <span className="text-[10px] text-zinc-400">Tanpa URL bar</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="block text-[11px] font-bold text-white">Full Screen</span>
                <span className="text-[10px] text-zinc-400">Mode sinema</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="block text-[11px] font-bold text-white">Akses Cepat</span>
                <span className="text-[10px] text-zinc-400">Ikon di layar</span>
              </div>
            </div>

            {/* Device Platform Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-[#e50914] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-[#e50914] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-[#e50914] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Laptop</span>
              </button>
            </div>

            {/* Tab Content Instructions */}
            <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 space-y-3">
              {activeTab === 'android' && (
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">1</span>
                    <p>Buka tautan ini di peramban <strong>Google Chrome</strong> atau peramban bawaan ponsel.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">2</span>
                    <p>Ketuk menu <strong>titik tiga (⋮)</strong> di sudut kanan atas peramban.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">3</span>
                    <p>Pilih menu <strong>Tambahkan ke Layar Utama</strong> atau <strong>Install Aplikasi</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">4</span>
                    <p>Ikon aplikasi Murflix akan terpasang di launcher ponsel Anda seperti APK resmi.</p>
                  </div>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">1</span>
                    <p>Buka situs Murflix menggunakan peramban <strong>Safari</strong> di perangkat iOS Anda.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">2</span>
                    <p>Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">3</span>
                    <p>Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">4</span>
                    <p>Ketuk <strong>Tambah</strong> di sudut kanan atas untuk memasang aplikasi.</p>
                  </div>
                </div>
              )}

              {activeTab === 'desktop' && (
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">1</span>
                    <p>Gunakan peramban <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">2</span>
                    <p>Klik ikon <strong>Install</strong> di sebelah kanan bilah alamat URL (address bar).</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">3</span>
                    <p>Klik <strong>Install</strong> pada jendela konfirmasi untuk membuka jendela mandiri.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 pt-1">
              {window.deferredPWAInstallPrompt ? (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Otomatis Sekarang</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-zinc-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Web'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
