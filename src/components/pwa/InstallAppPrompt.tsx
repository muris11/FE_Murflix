import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Apple, Check, Copy, ShieldCheck, Film, Star } from 'lucide-react';

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
 * Trigger the custom Murflix App Installer modal.
 * Always displays our custom in-app design instead of raw browser dialogs.
 */
export const triggerPWAInstallPrompt = () => {
  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
};

export const InstallAppPrompt: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 1. Detect if running inside standalone PWA display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check dismissal cooldown for floating banner
    const dismissedTime = localStorage.getItem('murflix_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // 3. Auto-detect default tab based on user agent
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    // 4. Check if early window prompt is ready
    if (window.deferredPWAInstallPrompt) {
      setIsInstallable(true);
    }

    // 5. Event listeners
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

  const handleExecuteInstall = async () => {
    const prompt = window.deferredPWAInstallPrompt;
    if (prompt) {
      try {
        setIsInstalling(true);
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowModal(false);
        }
        window.deferredPWAInstallPrompt = null;
        setIsInstallable(false);
      } catch (err) {
        console.warn('[PWA] Execution error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If native browser prompt is not exposed, guide user on current tab
      if (activeTab === 'android') {
        // Suggest browser menu
      }
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
      // Ignore
    }
  };

  return (
    <>
      {/* Floating Bottom Toast Prompt (Compact) */}
      {!isInstalled && !isDismissed && isInstallable && !showModal && (
        <aside
          aria-label="Pasang Aplikasi Murflix"
          className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#101013]/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-4 shadow-2xl animate-fadeIn"
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
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#e50914] hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Aplikasi</span>
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

      {/* Custom Designed Murflix App Installer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#111114] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black ring-1 ring-white/5 max-h-[92vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Top Bar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-red-900 to-black p-0.5 flex-shrink-0 shadow-xl shadow-red-950/50">
                  <img
                    src="/icon-192.png"
                    alt="Murflix Icon"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Murflix Streaming Hub</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Aplikasi Web Sinema Mandiri (PWA / WebAPK)</p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-zinc-400">
                    <span className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>4.9</span>
                    </span>
                    <span className="text-zinc-600">/</span>
                    <span>2.4 MB</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-red-400 font-semibold">4K Ultra HD</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-center">
                <Film className="w-4 h-4 text-red-500 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white">Bebas Browser</span>
                <span className="text-[10px] text-zinc-400">Tanpa URL bar</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white">100% Aman</span>
                <span className="text-[10px] text-zinc-400">Privasi terjaga</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-center">
                <Smartphone className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-white">Layar Penuh</span>
                <span className="text-[10px] text-zinc-400">Mode sinema HP</span>
              </div>
            </div>

            {/* Primary Action Button (If native prompt supported by current browser) */}
            {window.deferredPWAInstallPrompt && (
              <button
                type="button"
                onClick={handleExecuteInstall}
                disabled={isInstalling}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center space-x-2.5 shadow-xl shadow-red-600/30 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Memasang Aplikasi...' : 'Pasang Otomatis ke Perangkat Ini'}</span>
              </button>
            )}

            {/* Device Platform Tabs for Step-by-Step Guidance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Panduan Pemasangan Perangkat:
                </span>
              </div>

              {/* Tabs Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iPhone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('desktop')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'desktop'
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC / Laptop</span>
                </button>
              </div>

              {/* Instructions Panel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-zinc-800/80 space-y-3 text-xs text-zinc-300">
                {activeTab === 'android' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">1</span>
                      <p>Buka situs <strong>murflix.based.cc.cd</strong> di peramban <strong>Google Chrome</strong>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">2</span>
                      <p>Ketuk ikon menu titik tiga <strong>(⋮)</strong> di sudut kanan atas peramban.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">3</span>
                      <p>Pilih opsi <strong>Tambahkan ke Layar Utama</strong> atau <strong>Install Aplikasi</strong>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">4</span>
                      <p>Aplikasi Murflix akan langsung terpasang di launcher ponsel Anda tanpa perlu browser lagi.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">1</span>
                      <p>Buka situs <strong>murflix.based.cc.cd</strong> menggunakan peramban <strong>Safari</strong>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">2</span>
                      <p>Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah navigasi bawah Safari.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">3</span>
                      <p>Gulir ke bawah dan ketuk <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">4</span>
                      <p>Ketuk <strong>Tambah</strong> di sudut kanan atas untuk menyelesaikan pemasangan.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'desktop' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">1</span>
                      <p>Buka situs melalui peramban <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">2</span>
                      <p>Klik ikon <strong>Install</strong> di sebelah kanan bilah alamat URL (address bar).</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 border border-zinc-700">3</span>
                      <p>Klik tombol <strong>Install</strong> untuk membuat jendela aplikasi mandiri di komputer Anda.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 border border-zinc-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
