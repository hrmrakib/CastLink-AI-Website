"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check local storage for consent to ensure it only shows on first visit
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show the popup after a 15-second delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type: "accepted" | "rejected" | "customized") => {
    localStorage.setItem("cookie_consent", type);
    
    // Trigger closing animation
    setIsClosing(true);
    
    // Wait for the exit animation (300ms) to finish before removing from DOM
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          We value your privacy
        </h2>
        <p className="text-[15px] text-gray-700 mb-8 leading-relaxed">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => handleConsent("customized")}
            className="flex-1 px-4 py-2.5 border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Customize
          </button>
          <button
            onClick={() => handleConsent("rejected")}
            className="flex-1 px-4 py-2.5 border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Reject All
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white hover:bg-blue-700 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
