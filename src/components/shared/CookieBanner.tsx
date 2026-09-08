"use client";

import { useState, useEffect } from "react";
import {
  acceptAll,
  rejectAll,
  saveConsent,
  getConsent,
} from "@/lib/cookieConsent";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    if (!getConsent()) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  const handleAccept = () => {
    acceptAll();
    closeWithAnimation();
    window.location.reload();
  };

  const handleReject = () => {
    rejectAll();
    closeWithAnimation();
  };

  const handleSaveCustom = () => {
    saveConsent(prefs);
    closeWithAnimation();
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-colors duration-300 ${
        isClosing ? "bg-black/0" : "bg-black/40"
      }`}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-lg w-full p-6 md:p-8 transform transition-all duration-300 ${
          isClosing 
            ? "scale-95 opacity-0" 
            : "scale-100 opacity-100 animate-in fade-in zoom-in-95"
        }`}
      >
        {!showCustomize ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              We value your privacy
            </h2>
            <p className="text-[15px] text-gray-700 mb-8 leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => setShowCustomize(true)}
                className="flex-1 px-4 py-2.5 border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Customize
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white hover:bg-blue-700 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Customize Cookie Preferences
            </h2>
            <p className="text-[14px] text-gray-600 mb-6">
              Select which categories of cookies you want to allow. Necessary cookies are always enabled.
            </p>
            <div className="space-y-4 mb-8">
              <label className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-md">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">Necessary</span>
                  <span className="text-xs text-gray-500">Required for the site to function</span>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 text-blue-600 rounded" />
              </label>
              {(["analytics", "marketing", "functional"] as const).map((cat) => (
                <label key={cat} className="flex items-center justify-between text-sm p-3 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer">
                  <span className="capitalize font-medium text-gray-800">{cat} cookies</span>
                  <input
                    type="checkbox"
                    checked={prefs[cat]}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, [cat]: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2.5 bg-[#2563EB] text-white hover:bg-blue-700 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
