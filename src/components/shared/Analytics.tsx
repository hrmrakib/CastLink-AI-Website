"use client";

import { useEffect } from "react";
import { getConsent } from "@/lib/cookieConsent";

export default function Analytics() {
  useEffect(() => {
    const consent = getConsent();
    if (!consent?.analytics) return;

    // We only load this if the user consented to analytics
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: unknown[]) {
      (window as any).dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX');
  }, []);

  return null;
}
