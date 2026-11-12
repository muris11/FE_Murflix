import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const triggerPWAInstallPrompt = async () => {
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
    }
  } else {
    alert(
      'Petunjuk Pemasangan:\n\n' +
      '1. Android / Chrome: Buka menu peramban lalu pilih "Tambahkan ke Layar Utama" atau "Install Aplikasi".\n' +
      '2. iPhone / Safari: Ketuk tombol Bagikan (Share) di bilah bawah lalu pilih "Tambahkan ke Layar Utama".\n' +
      '3. Laptop / PC: Klik ikon "Install" di bilah alamat URL peramban Anda.'
    );
  }
};

export const InstallAppPrompt: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed in standalone mode (PWA / APK mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed recently (last 24 hours)
    const dismissedTime = localStorage.getItem('murflix_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|chrome/.test(ua);
    if (isAppleDevice && isSafari && !isStandalone) {
      setIsIOS(true);
    }

    // 4. Listen for Chromium beforeinstallprompt event (Android / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt = null;
      localStorage.setItem('murflix_pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      deferredPrompt = null;
    } catch (err) {
      console.warn('[PWA] Error launching install prompt:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('murflix_pwa_dismissed', Date.now().toString());
  };

  if (isInstalled || isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
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
                onClick={handleDismiss}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Akses cepat tanpa browser seperti aplikasi APK langsung dari layar utama perangkat Anda.
            </p>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#e50914] hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Cara Pasang di iPhone' : 'Pasang Sekarang'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#161619] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">Pasang di iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Safari di iOS memerlukan penambahan manual ke layar utama:
            </p>

            <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside bg-black/50 p-3 rounded-xl border border-zinc-800/80">
              <li>Ketuk ikon <strong>Bagikan (Share)</strong> di bilah bawah Safari.</li>
              <li>Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
              <li>Ketuk <strong>Tambah</strong> di sudut kanan atas.</li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
