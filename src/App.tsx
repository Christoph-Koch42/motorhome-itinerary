import { useEffect, useState } from 'react';
import type { DayEntry } from './types';
import { loadDays, saveDays, genId } from './storage';
import { todayStr, addOneDay } from './date';
import DayCard from './DayCard';
import DayForm from './DayForm';
import './App.css';

export default function App() {
  const [days, setDays] = useState<DayEntry[]>(() => loadDays());
  const [editing, setEditing] = useState<DayEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    saveDays(days);
  }, [days]);

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  const handleSave = (day: DayEntry) => {
    setDays((prev) => {
      const exists = prev.some((d) => d.id === day.id);
      return exists
        ? prev.map((d) => (d.id === day.id ? day : d))
        : [...prev, day];
    });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this day?')) {
      setDays((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleCopy = (day: DayEntry) => {
    setDays((prev) => [
      ...prev,
      { ...day, id: genId(), date: addOneDay(day.date) },
    ]);
  };

  const today = todayStr();

  const totalKm = sortedDays.reduce((sum, d) => sum + (d.km ?? 0), 0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Motorhome Itinerary</h1>
        {sortedDays.length > 0 && (
          <p className="trip-summary">
            {sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''} ·{' '}
            {totalKm} km total
          </p>
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
        {sortedDays.length === 0 ? (
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
