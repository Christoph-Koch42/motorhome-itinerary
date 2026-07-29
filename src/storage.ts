import type { DayEntry } from './types';

const STORAGE_KEY = 'motorhome-itinerary-days';

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost),
// so it throws when testing over a plain http://<lan-ip> dev server.
export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadDays(): DayEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const days = JSON.parse(raw) as DayEntry[];
    // Fill in fields added after some entries were already saved.
    return days.map((d) => ({ ...d, mapsLink: d.mapsLink ?? '' }));
  } catch {
    return [];
  }
}

export function saveDays(days: DayEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}
