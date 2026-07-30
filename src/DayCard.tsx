import type { DayEntry } from './types';
import { OVERNIGHT_TYPE_LABELS, BOOKING_STATUS_LABELS } from './types';
import { minutesToHM } from './duration';

interface DayCardProps {
  day: DayEntry;
  isToday: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

const statusClass: Record<DayEntry['bookingStatus'], string> = {
  planned: 'status-planned',
  requested: 'status-requested',
  not_possible: 'status-not-possible',
  confirmed: 'status-confirmed',
};

export default function DayCard({
  day,
  isToday,
  onEdit,
  onDelete,
  onCopy,
}: DayCardProps) {
  const amenities = [
    day.hookup && 'Hookup',
    day.water && 'Water',
    day.dump && 'Dump',
  ].filter(Boolean) as string[];

  return (
    <article
      id={`day-${day.id}`}
      className={`day-card${isToday ? ' day-card-today' : ''}`}
    >
      <header>
        <div className="day-card-date">
          {isToday && <span className="today-tag">Today</span>}
          {new Date(day.date).toLocaleDateString(undefined, {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          })}
          {day.time && <span className="day-card-time">{day.time}</span>}
        </div>
        <div className="day-card-actions">
          <button className="icon-button" onClick={onCopy} aria-label="Copy">
            Copy
          </button>
          <button className="icon-button" onClick={onEdit} aria-label="Edit">
            Edit
          </button>
          <button
            className="icon-button danger"
            onClick={onDelete}
            aria-label="Delete"
          >
            Delete
          </button>
        </div>
      </header>

      <h3>
        <span className="activity-tag">
          {day.activityType === 'travel' ? 'Travel' : 'Stay'}
        </span>
        {day.activityTitle || (day.activityType === 'travel' ? 'Travel day' : 'Stay')}
      </h3>

      {(day.km != null || day.driveMinutes != null) && (
        <p className="day-card-km">
          {day.km != null && `${day.km} km`}
          {day.km != null && day.driveMinutes != null && ' · '}
          {day.driveMinutes != null && `${minutesToHM(day.driveMinutes)} driving`}
        </p>
      )}

      <div className="overnight-block">
        <span className={`status-badge ${statusClass[day.bookingStatus]}`}>
          {BOOKING_STATUS_LABELS[day.bookingStatus]}
        </span>
        <span className="overnight-place">
          {day.overnightPlace || 'No place set'} ·{' '}
          {OVERNIGHT_TYPE_LABELS[day.overnightType]}
        </span>
        {day.price != null && <span className="price">€{day.price}</span>}
        {day.mapsLink && (
          <a
            className="maps-link"
            href={day.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Maps
          </a>
        )}
      </div>

      {day.documents.length > 0 && (
        <div className="document-list">
          <span className="document-list-heading">Documents:</span>
          {day.documents.map((doc) => (
            <a
              key={doc.id}
              className="document-link"
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doc.label || 'Document'}
            </a>
          ))}
        </div>
      )}

      {amenities.length > 0 && (
        <div className="amenities">
          {amenities.map((a) => (
            <span key={a} className="amenity-tag">
              {a}
            </span>
          ))}
        </div>
      )}

      {day.highlights && <p className="highlights">{day.highlights}</p>}
    </article>
  );
}
