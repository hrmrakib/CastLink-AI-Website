export type ConsentCategory = "necessary" | "analytics" | "marketing" | "functional";

export interface ConsentState {
  necessary: true; // always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 180;

export const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: 0,
};

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;

  try {
    const parsed: ConsentState = JSON.parse(raw);
    const ageDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
    if (ageDays > CONSENT_EXPIRY_DAYS) return null; // expired, re-ask
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(state: Omit<ConsentState, "necessary" | "timestamp">) {
  const full: ConsentState = {
    necessary: true,
    ...state,
    timestamp: Date.now(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  document.cookie = `cookie_consent=${encodeURIComponent(
    JSON.stringify(full)
  )}; path=/; max-age=${CONSENT_EXPIRY_DAYS * 24 * 60 * 60}; SameSite=Lax`;
  return full;
}

export function acceptAll() {
  return saveConsent({ analytics: true, marketing: true, functional: true });
}

export function rejectAll() {
  return saveConsent({ analytics: false, marketing: false, functional: false });
}
