import React, { useState, useEffect } from 'react';
import { Download, WifiOff, RefreshCw, CheckCircle2, ShieldCheck, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallerBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [swUpdateWaiting, setSwUpdateWaiting] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect Standalone / PWA Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // 2. Register Service Worker & Check Updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);
          setSwRegistration(reg);

          // Check for waiting update
          if (reg.waiting) {
            setSwUpdateWaiting(true);
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateWaiting(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });

      // Handle controllerchange (page reload when SW updates)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 3. Listen for PWA Install Prompt (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('[PWA] beforeinstallprompt captured - App is installable');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for App Installed Event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setIsInstallable(false);
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Network Status Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger PWA Install
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback hint for iOS Safari or browsers where prompt isn't directly triggerable
      alert(
        'Untuk memasang aplikasi ERP di HP / PC:\n\n' +
          '• Chrome/Edge (PC): Klik ikon "Install" di address bar browser.\n' +
          '• iOS Safari: Tekan tombol Share (Bagikan) -> "Add to Home Screen" (Tambahkan ke Layar Utama).\n' +
          '• Android Chrome: Tekan titik tiga menu -> "Pasang Aplikasi" / "Install App".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Trigger SW Update Skip Waiting
  const handleUpdateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* 1. OFFLINE STATUS TOAST */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-amber-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-amber-400/30">
            <WifiOff className="h-4 w-4 animate-pulse text-amber-200" />
            <span>Mode Offline Aktif: Menggunakan Data Cache Lokal</span>
          </div>
        </div>
      )}

      {/* 2. SERVICE WORKER UPDATE WAITING BANNER */}
      {swUpdateWaiting && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-semibold border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-300 animate-spin" />
            <span>Pembaruan Versi Aplikasi Enterprise PWA Tersedia!</span>
          </div>
          <button
            onClick={handleUpdateApp}
            className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Perbarui Sekarang</span>
          </button>
        </div>
      )}

      {/* 3. INSTALL SUCCESS NOTIFICATION */}
      {installSuccess && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-emerald-400/30">
          <CheckCircle2 className="h-6 w-6 text-emerald-200" />
          <div>
            <p className="text-sm font-extrabold">Aplikasi PWA Berhasil Terpasang!</p>
            <p className="text-emerald-100 font-normal text-[11px]">Buka ERP Sekolah langsung dari Desktop / Home Screen tanpa browser.</p>
          </div>
        </div>
      )}

      {/* 4. FLOATING PWA INSTALL PROMPT PROMO (If installable & not dismissed) */}
      {isInstallable && !isStandalone && !bannerDismissed && (
        <div className="bg-slate-900 text-white border-b border-amber-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
              PWA
            </div>
            <div>
              <p className="font-extrabold text-slate-100 flex items-center gap-1.5">
                <span>Pasang Aplikasi Enterprise ERP Sekolah</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Desktop & Mobile Native
                </span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Akses secepat kilat, bekerja offline, tanpa perlu membuka browser secara manual.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3.5 py-1.5 rounded-lg font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-slate-950 stroke-[3]" />
              <span>Pasang Aplikasi (Install PWA)</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-slate-400 hover:text-white px-2 py-1 text-xs font-semibold cursor-pointer"
            >
              Nanti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Standalone Header Button Component for Topbar Integration
export const PWAInstallHeaderButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isStandaloneMode =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) ||
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
    } else {
      alert(
        'Aplikasi Enterprise ERP siap dipasang!\n\n' +
        '• Desktop: Klik tombol ikon "Install" di sudut kanan address bar browser.\n' +
        '• Android: Klik menu browser -> "Install App" / "Pasang Aplikasi".\n' +
        '• iPhone/iPad: Klik ikon Share -> "Add to Home Screen".'
      );
    }
  };

  if (isStandalone) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider font-mono shadow-sm">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
        <span>STANDALONE PWA</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstall}
      title="Pasang Aplikasi ERP ke Desktop / Home Screen Mobile"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-sm transition-all cursor-pointer active:scale-95"
    >
      <Download className="h-3.5 w-3.5 stroke-[2.5]" />
      <span className="hidden lg:inline">Pasang PWA</span>
    </button>
  );
};
