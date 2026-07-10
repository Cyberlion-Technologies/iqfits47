"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Share, PlusSquare, Smartphone, Info, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect user OS on mount to set the default tab
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android/i.test(userAgent)) {
        setActiveTab("android");
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setActiveTab("ios");
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      // Trigger the browser's install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      // Clear the deferred prompt variable since it can only be used once
      setDeferredPrompt(null);
    } else {
      // Fallback: Show instructions modal
      setActiveTab("android");
      setIsModalOpen(true);
    }
  };

  const handleiOSInstall = () => {
    setActiveTab("ios");
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <span className="font-mono text-xs text-stone-50/50 uppercase tracking-widest">Download our App</span>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
          {/* iOS / App Store Button */}
          <button
            onClick={handleiOSInstall}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3.5 py-1.5 text-stone-50 border border-stone-800 transition-all hover:bg-stone-900 hover:border-stone-700 hover:text-white"
          >
            {/* Apple Logo SVG */}
            <svg viewBox="0 0 384 512" className="h-4.5 w-4.5 fill-current text-white shrink-0">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-48.7-22.9-76.9-22.4-36.6.6-70.2 21.6-89 53.5-38.5 66.4-9.9 161.9 27.2 216.7 18.2 26.2 39.9 55.4 68.2 54.4 27.1-1 37.3-17.4 69.8-17.4 32.3 0 42 17.4 70.3 16.8 28.8-.6 48-26.3 66.2-52.9 21-30.7 29.7-60.4 30.2-61.9-1.2-.5-60.2-22.9-60.8-91.2zM270.3 84.4c21.6-26 36-62.2 32-98.4-31.2 1.3-69.2 20.7-91.5 46.9-19.5 22.8-36.6 60-32.6 95.5 34.5 2.7 70.2-18 92.1-44z" />
            </svg>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[7px] uppercase tracking-wider text-stone-400">Download for iOS</span>
              <span className="text-[11px] font-semibold mt-0.5 font-sans">App Store</span>
            </div>
          </button>

          {/* Android / Google Play Button */}
          <button
            onClick={handleAndroidInstall}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3.5 py-1.5 text-stone-50 border border-stone-800 transition-all hover:bg-stone-900 hover:border-stone-700 hover:text-white"
          >
            {/* Play Store Logo SVG */}
            <svg viewBox="0 0 360 360" className="h-4.5 w-4.5 shrink-0">
              <path fill="#2196F3" d="M40.9 18.2C34.1 25.1 30 35.8 30 49.3v261.4c0 13.5 4.1 24.2 10.9 31.1L46 347 210.8 182.2V177.8L46 13 40.9 18.2z" />
              <path fill="#4CAF50" d="M265.8 237.2l-55-55v-4.4l55-55 5.2 3c12.2 7 21.6 19.3 21.6 34.2s-9.4 27.2-21.6 34.2l-5.2 3z" />
              <path fill="#F44336" d="M210.8 177.8L46 13C52.8 6.1 63.6 2 77.1 2c5.9 0 11.8 1.5 17.2 4.6l171.5 98.1 55 55-110 18.1z" />
              <path fill="#FFEB3B" d="M210.8 182.2l-110 110-6.2-3.6L46 347c6.8 6.9 17.6 11 31.1 11 5.9 0 11.8-1.5 17.2-4.6l171.5-98.1 55-55-110 18.1z" />
            </svg>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[7px] uppercase tracking-wider text-stone-400">Download for Android</span>
              <span className="text-[11px] font-semibold mt-0.5 font-sans">Google Play</span>
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-50/10 bg-zinc-900 p-6 shadow-2xl text-stone-50"
              >
                {/* Diagonal stripes top-right corner background */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rotate-45 bg-gradient-to-b from-hazard/10 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 rounded-full p-2 text-stone-50/40 hover:bg-stone-50/5 hover:text-stone-50 transition-colors"
                  aria-label="Close download modal"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 -skew-x-12 shrink-0">
                    <div className="h-6 w-1.5 bg-hazard" />
                    <div className="h-6 w-1.5 bg-hazard" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-hazard font-bold">
                      INSTALL IQFITS-47 APP
                    </span>
                    <h3 className="font-display text-xl uppercase tracking-tight text-stone-50 mt-0.5">
                      Add site to Home Screen
                    </h3>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 flex border-b border-stone-50/10">
                  <button
                    onClick={() => setActiveTab("ios")}
                    className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 ${
                      activeTab === "ios"
                        ? "border-hazard text-hazard"
                        : "border-transparent text-stone-50/40 hover:text-stone-50/70"
                    }`}
                  >
                    Apple iOS
                  </button>
                  <button
                    onClick={() => setActiveTab("android")}
                    className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase transition-colors border-b-2 ${
                      activeTab === "android"
                        ? "border-hazard text-hazard"
                        : "border-transparent text-stone-50/40 hover:text-stone-50/70"
                    }`}
                  >
                    Android
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="mt-6">
                  {activeTab === "ios" ? (
                    <div className="space-y-4">
                      <p className="text-sm text-stone-50/70">
                        iOS Safari does not support automated app installation. Follow these quick steps to install the app on your Apple device:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            1
                          </div>
                          <div className="text-sm">
                            Tap the <strong className="text-stone-50 inline-flex items-center gap-1">Share <Share size={14} className="inline text-hazard" /></strong> button in the Safari browser toolbar at the bottom of the screen.
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            2
                          </div>
                          <div className="text-sm">
                            Scroll down the share menu and tap <strong className="text-stone-50 inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={14} className="inline text-hazard" /></strong>.
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            3
                          </div>
                          <div className="text-sm">
                            Tap <strong className="text-stone-50">Add</strong> in the top right corner. The IQFITS-47 icon will now appear on your home screen like a native app.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-stone-50/70">
                        To install the app on your Android device using Chrome, Firefox, or Samsung Internet:
                      </p>

                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            1
                          </div>
                          <div className="text-sm">
                            Tap the menu icon in the top right corner of your browser (usually represented by <strong className="text-stone-50">three dots</strong>).
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            2
                          </div>
                          <div className="text-sm">
                            Select <strong className="text-stone-50 inline-flex items-center gap-1">Install App <Download size={14} className="inline text-hazard" /></strong> or <strong className="text-stone-50">Add to Home Screen</strong>.
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hazard/10 text-hazard text-xs font-mono font-bold">
                            3
                          </div>
                          <div className="text-sm">
                            Confirm the prompt to install. The IQFITS-47 app is now accessible directly from your app drawer!
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer notes */}
                <div className="mt-6 pt-4 border-t border-stone-50/15 flex items-start gap-2 text-[10px] text-stone-50/40">
                  <Info size={12} className="text-hazard shrink-0 mt-0.5" />
                  <span>
                    Installing the Progressive Web App (PWA) uses virtually no device storage, offers offline order tracking, and provides faster page loading.
                  </span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
