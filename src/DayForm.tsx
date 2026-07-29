import { useState } from 'react';
import type {
  DayEntry,
  ActivityType,
  OvernightType,
  BookingStatus,
} from './types';
import { OVERNIGHT_TYPE_LABELS, BOOKING_STATUS_LABELS } from './types';
import { genId } from './storage';

const emptyDay = (): DayEntry => ({
  id: genId(),
  date: new Date().toISOString().slice(0, 10),
  activityType: 'travel',
  activityTitle: '',
  km: null,
  overnightPlace: '',
  overnightType: 'campground',
  mapsLink: '',
  bookingStatus: 'planned',
  price: null,
  hookup: false,
  water: false,
  dump: false,
  highlights: '',
});

interface DayFormProps {
  initial?: DayEntry;
  onSave: (day: DayEntry) => void;
  onCancel: () => void;
}

export default function DayForm({ initial, onSave, onCancel }: DayFormProps) {
  const [day, setDay] = useState<DayEntry>(initial ?? emptyDay());

  const update = <K extends keyof DayEntry>(key: K, value: DayEntry[K]) => {
    setDay((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(day);
  };

  return (
    <form className="day-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Date
          <input
            type="date"
            value={day.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
        </label>
        <label>
          Activity
          <select
            value={day.activityType}
            onChange={(e) =>
              update('activityType', e.target.value as ActivityType)
            }
          >
            <option value="travel">Travel</option>
            <option value="stay">Stay</option>
          </select>
        </label>
      </div>

      <label>
        Title
        <input
          type="text"
          placeholder="e.g. Drive to Lake Como"
          value={day.activityTitle}
          onChange={(e) => update('activityTitle', e.target.value)}
        />
      </label>

      <label>
        Distance (km)
        <input
          type="number"
          min="0"
          value={day.km ?? ''}
          onChange={(e) =>
            update('km', e.target.value === '' ? null : Number(e.target.value))
          }
        />
      </label>

      <div className="form-row">
        <label>
          Overnight place
          <input
            type="text"
            placeholder="e.g. Camping Bella Vista"
            value={day.overnightPlace}
            onChange={(e) => update('overnightPlace', e.target.value)}
          />
        </label>
        <label>
          Type
          <select
            value={day.overnightType}
            onChange={(e) =>
              update('overnightType', e.target.value as OvernightType)
            }
          >
            {Object.entries(OVERNIGHT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Location (Google Maps link)
        <input
          type="url"
          placeholder="https://maps.app.goo.gl/..."
          value={day.mapsLink}
          onChange={(e) => update('mapsLink', e.target.value)}
        />
      </label>

      <div className="form-row">
        <label>
          Booking status
          <select
            value={day.bookingStatus}
            onChange={(e) =>
              update('bookingStatus', e.target.value as BookingStatus)
            }
          >
            {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price (per night)
          <input
            type="number"
            min="0"
            step="0.01"
            value={day.price ?? ''}
            onChange={(e) =>
              update(
                'price',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </label>
      </div>

      <div className="form-row checkboxes">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={day.hookup}
            onChange={(e) => update('hookup', e.target.checked)}
          />
          Electric hookup
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={day.water}
            onChange={(e) => update('water', e.target.checked)}
          />
          Water
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={day.dump}
            onChange={(e) => update('dump', e.target.checked)}
          />
          Dump station
        </label>
      </div>

      <label>
        Highlights / places to visit
        <textarea
          rows={3}
          placeholder="e.g. Old town, viewpoint, farmers market"
          value={day.highlights}
          onChange={(e) => update('highlights', e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
