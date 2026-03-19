const STORAGE_KEY = "alopedia_guest_used";
const COOKIE_NAME = "alopedia_guest_used";

export function hasGuestUsed(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(STORAGE_KEY) === "true") return true;
  if (document.cookie.includes(`${COOKIE_NAME}=true`)) return true;
  return false;
}

export function markGuestUsed(): void {
  localStorage.setItem(STORAGE_KEY, "true");
  document.cookie = `${COOKIE_NAME}=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`;
}
