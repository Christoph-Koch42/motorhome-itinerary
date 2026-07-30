import { useState } from 'react';
import type {
  DayEntry,
  DocumentLink,
  ActivityType,
  OvernightType,
  BookingStatus,
} from './types';
import { OVERNIGHT_TYPE_LABELS, BOOKING_STATUS_LABELS } from './types';
import { genId } from './storage';
import { minutesToHM, hmToMinutes } from './duration';

const emptyDay = (): DayEntry => ({
  id: genId(),
  date: new Date().toISOString().slice(0, 10),
  time: '',
  activityType: 'travel',
  activityTitle: '',
  km: null,
  driveMinutes: null,
  overnightPlace: '',
  overnightType: 'campground',
  mapsLink: '',
  documents: [],
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
  const [driveTimeText, setDriveTimeText] = useState(
    minutesToHM(day.driveMinutes),
  );

  const update = <K extends keyof DayEntry>(key: K, value: DayEntry[K]) => {
    setDay((prev) => ({ ...prev, [key]: value }));
  };

  const addDocument = () => {
    update('documents', [...day.documents, { id: genId(), label: '', url: '' }]);
  };

  const updateDocument = (id: string, patch: Partial<DocumentLink>) => {
    update(
      'documents',
      day.documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)),
    );
  };

  const removeDocument = (id: string) => {
    update('documents', day.documents.filter((doc) => doc.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...day,
      driveMinutes: hmToMinutes(driveTimeText),
      documents: day.documents.filter((doc) => doc.url.trim() !== ''),
    });
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
          Time (optional)
          <input
            type="time"
            value={day.time}
            onChange={(e) => update('time', e.target.value)}
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

      <div className="form-row">
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
        <label>
          Driving time (h:mm)
          <input
            type="text"
            placeholder="3:45"
            value={driveTimeText}
            onChange={(e) => setDriveTimeText(e.target.value)}
          />
        </label>
      </div>

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

      <div className="document-list-editor">
        <span className="document-list-label">Documents (Google Drive, etc.)</span>
        {day.documents.map((doc) => (
          <div className="document-row" key={doc.id}>
            <input
              type="text"
              placeholder="Label, e.g. Ferry ticket"
              value={doc.label}
              onChange={(e) => updateDocument(doc.id, { label: e.target.value })}
            />
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={doc.url}
              onChange={(e) => updateDocument(doc.id, { url: e.target.value })}
            />
            <button
              type="button"
              className="icon-button danger"
              onClick={() => removeDocument(doc.id)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="secondary" onClick={addDocument}>
          Add document
        </button>
      </div>

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
