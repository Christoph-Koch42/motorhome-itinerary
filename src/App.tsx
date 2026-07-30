import { useEffect, useState } from 'react';
import type { DayEntry } from './types';
import { subscribeToDays, saveDay, deleteDay, genId } from './storage';
import { todayStr, addOneDay } from './date';
import { minutesToHM } from './duration';
import { downloadCsv } from './csv';
import { useAuthUser, signOutUser } from './auth';
import LoginForm from './auth';
import DayCard from './DayCard';
import DayForm from './DayForm';
import './App.css';

export default function App() {
  const { user, loading: authLoading } = useAuthUser();
  const [days, setDays] = useState<DayEntry[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
  const [editing, setEditing] = useState<DayEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDaysLoading(true);
    const unsubscribe = subscribeToDays((loaded) => {
      setDays(loaded);
      setDaysLoading(false);
    });
    return unsubscribe;
  }, [user]);

  if (authLoading) {
    return <div className="app-loading">Loading…</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  const sortedDays = [...days].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time.localeCompare(b.time);
  });

  // Writes are fire-and-forget: Firestore's offline cache applies them to
  // the local view immediately and syncs to the server once back online,
  // so the UI shouldn't block waiting for a network round-trip.
  const handleSave = (day: DayEntry) => {
    saveDay(day).catch(console.error);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this day?')) {
      deleteDay(id).catch(console.error);
    }
  };

  const handleCopy = (day: DayEntry) => {
    saveDay({ ...day, id: genId(), date: addOneDay(day.date) }).catch(
      console.error,
    );
  };

  const today = todayStr();
  const totalKm = sortedDays.reduce((sum, d) => sum + (d.km ?? 0), 0);
  const totalMinutes = sortedDays.reduce((sum, d) => sum + (d.driveMinutes ?? 0), 0);
  const totalCost = sortedDays.reduce((sum, d) => sum + (d.price ?? 0), 0);

  const scrollToToday = () => {
    const target =
      sortedDays.find((d) => d.date >= today) ?? sortedDays[sortedDays.length - 1];
    if (!target) return;
    document
      .getElementById(`day-${target.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Motorhome Itinerary</h1>
          <button className="icon-button" onClick={() => signOutUser()}>
            Sign out
          </button>
        </div>
        <p className="signed-in-as">Signed in as {user.email}</p>
        {sortedDays.length > 0 && (
          <>
            <p className="trip-summary">
              {sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''} ·{' '}
              {totalKm} km · {minutesToHM(totalMinutes)} driving · €
              {totalCost.toFixed(2)}
            </p>
            <div className="header-actions">
              <button className="icon-button export-button" onClick={scrollToToday}>
                Go to today
              </button>
              <button
                className="icon-button export-button"
                onClick={() => downloadCsv(sortedDays)}
              >
                Export CSV
              </button>
            </div>
          </>
        )}
      </header>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <DayForm
              initial={editing ?? undefined}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}

      <main>
        {daysLoading ? (
          <p className="empty-state">Loading itinerary…</p>
        ) : sortedDays.length === 0 ? (
          <p className="empty-state">
            No days yet. Add your first day of the trip.
          </p>
        ) : (
          <div className="day-list">
            {sortedDays.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                isToday={day.date === today}
                onEdit={() => {
                  setEditing(day);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(day.id)}
                onCopy={() => handleCopy(day)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        className="fab"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        aria-label="Add day"
      >
        +
      </button>
    </div>
  );
}
