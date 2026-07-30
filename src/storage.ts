import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import type { DayEntry } from './types';
import { db } from './firebase';

const DAYS_COLLECTION = 'days';

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost),
// so it throws when testing over a plain http://<lan-ip> dev server.
export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Fires immediately with cached data (works offline), then again whenever
// the shared trip data changes on either phone.
export function subscribeToDays(onChange: (days: DayEntry[]) => void): () => void {
  return onSnapshot(collection(db, DAYS_COLLECTION), (snapshot) => {
    const days = snapshot.docs.map((d) => ({
      ...(d.data() as Omit<DayEntry, 'id'>),
      id: d.id,
    }));
    onChange(days);
  });
}

export function saveDay(day: DayEntry): Promise<void> {
  const { id, ...data } = day;
  return setDoc(doc(db, DAYS_COLLECTION, id), data);
}

export function deleteDay(id: string): Promise<void> {
  return deleteDoc(doc(db, DAYS_COLLECTION, id));
}
