import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  Share2,
  PlusSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Sparkles,
  X,
  ExternalLink,
  Laptop,
  Check,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'android' | 'ios' | 'desktop';

export const DownloadAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    platformName,
    install,
  } = usePWAInstall();

  // Auto-detect default tab based on user device
  const defaultTab: TabType = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  const [selectedTab, setSelectedTab] = useState<TabType>(defaultTab);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Download className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Download & Install Edura High</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Cross-Platform
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Install as a native application on Android, iPhone/iPad, Windows PC, or Mac.
              </p>
            </div>
          </div>

          {/* Quick Active Platform Detector */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-blue-100">
              Your detected device: <strong className="text-white">{platformName}</strong>
            </span>
            {isInstalled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Installed & Running
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-[11px]">
                <Zap className="w-3 h-3 text-amber-300" /> Instant 1-Tap Ready
              </span>
            )}
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('android')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'android'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Android (Play Store Style)</span>
          </button>

          <button
            onClick={() => setSelectedTab('ios')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'ios'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-900" />
            <span>Apple iOS (App Store Style)</span>
          </button>

          <button
            onClick={() => setSelectedTab('desktop')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'desktop'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-indigo-600" />
            <span>Windows & Mac Desktop</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 space-y-5">
          {/* TAB 1: ANDROID / PLAY STORE */}
          {selectedTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Android & Google Play Store Architecture
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Edura High installs directly to your Android device via Progressive Web App
                    (PWA) / Trusted Web Activity technology. It adds an icon to your phone screen and app
                    drawer, runs standalone without browser bars, and caches lessons for offline study!
                  </p>
                </div>
              </div>

              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">One-Tap Android Installation</h4>
                    <p className="text-xs text-blue-700">Click below to trigger the Android system install dialog.</p>
                  </div>
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Android</span>
                  </button>
                </div>
              )}

              {/* Step by step manual guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Installation Steps for Android (Chrome, Samsung Internet, Edge)
                </h4>
                <ol className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Open this site in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Tap the <strong>three dots (⋮)</strong> menu icon in the top right or bottom bar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>
                      Confirm <strong>&ldquo;Install&rdquo;</strong>. The Edura High app icon will be added to your home screen and launcher!
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE IOS / APP STORE */}
          {selectedTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-slate-100 border border-slate-200 rounded-2xl p-4">
                <div className="p-2 bg-slate-200 rounded-xl text-slate-900 shrink-0">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Apple iOS & App Store Native Standards
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    On iPhone and iPad, Apple provides direct home screen installation through Safari WebKit.
                    Once added, Edura High opens full-screen like an official App Store app with high-resolution
                    retina icons and offline storage.
                  </p>
                </div>
              </div>

              {/* Visual Tutorial for iOS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  How to Install on iPhone & iPad (Safari)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Step 1</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        Tap the Share button
                      </p>
                      <p className="text-[11px] text-slate-500">
                        At the bottom of your Safari browser, tap the square icon with an upward arrow.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <PlusSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 2</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        &ldquo;Add to Home Screen&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Scroll down the share sheet and select &ldquo;Add to Home Screen&rdquo;, then tap &ldquo;Add&rdquo;.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Note:</strong> Make sure you are using <strong>Safari</strong> on iOS. Chrome on iOS does not support adding to home screen directly due to Apple restrictions.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP WINDOWS & MAC */}
          {selectedTab === 'desktop' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-800 shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    Windows PC & macOS Desktop App
                  </h3>
                  <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                    Install Edura High as a standalone desktop application on Windows 10/11 or macOS.
                    Runs in its own window, launches from your Start Menu or Dock, and supports keyboard shortcuts.
                  </p>
                </div>
              </div>

              {/* Direct Desktop Install if installable */}
              {isInstallable && (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">Direct Desktop Installation</h4>
                    <p className="text-xs text-indigo-700">Install to your desktop taskbar and Start Menu now.</p>
                  </div>
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Desktop App</span>
                  </button>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Installation Steps for Windows & Mac
                </h4>
                <p>
                  Look at the right side of your browser address bar (URL bar in Chrome or Edge). You will see an <strong>install icon (computer with down arrow or &ldquo;+&rdquo;)</strong>.
                </p>
                <p>
                  Click the install icon and confirm <strong>&ldquo;Install Edura High&rdquo;</strong>. The app will launch in a dedicated high-performance desktop window!
                </p>
              </div>
            </div>
          )}

          {/* Key Advantages of PWA Architecture */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Works 100% Offline</p>
                <p className="text-[11px] text-slate-500">Study notes cached locally</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Zero App Store Bloat</p>
                <p className="text-[11px] text-slate-500">Saves your phone data & memory</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Verified & Auto-Updating</p>
                <p className="text-[11px] text-slate-500">Always runs the latest version</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Share install link with classmates:</span>
            <button
              onClick={handleCopyLink}
              className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer flex items-center gap-1"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                'Copy App URL'
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isInstallable && (
              <button
                onClick={handleTriggerInstall}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Install Directly</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
