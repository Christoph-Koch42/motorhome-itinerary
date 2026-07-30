// Driving time is a duration (can exceed 24h in theory), not a time of day,
// so it's edited as free text like "3:45" rather than an <input type="time">.
export function minutesToHM(minutes: number | null): string {
  if (minutes == null) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function hmToMinutes(text: string): number | null {
  const match = text.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  return hours * 60 + mins;
}
