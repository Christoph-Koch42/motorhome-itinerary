import type { DayEntry } from './types';
import { OVERNIGHT_TYPE_LABELS, BOOKING_STATUS_LABELS } from './types';
import { minutesToHM } from './duration';

const COLUMNS = [
  'Date',
  'Time',
  'Activity type',
  'Activity title',
  'Km',
  'Driving time',
  'Overnight place',
  'Overnight type',
  'Maps link',
  'Documents',
  'Booking status',
  'Price',
  'Hookup',
  'Water',
  'Dump',
  'Highlights',
];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function dayToRow(day: DayEntry): string[] {
  return [
    day.date,
    day.time,
    day.activityType,
    day.activityTitle,
    day.km != null ? String(day.km) : '',
    minutesToHM(day.driveMinutes),
    day.overnightPlace,
    OVERNIGHT_TYPE_LABELS[day.overnightType],
    day.mapsLink,
    day.documents.map((d) => `${d.label || 'Document'}: ${d.url}`).join('; '),
    BOOKING_STATUS_LABELS[day.bookingStatus],
    day.price != null ? String(day.price) : '',
    day.hookup ? 'yes' : 'no',
    day.water ? 'yes' : 'no',
    day.dump ? 'yes' : 'no',
    day.highlights,
  ];
}

export function daysToCsv(days: DayEntry[]): string {
  const lines = [COLUMNS, ...days.map(dayToRow)].map((row) =>
    row.map(escapeCsvField).join(','),
  );
  return lines.join('\r\n');
}

export function downloadCsv(days: DayEntry[], filename = 'motorhome-itinerary.csv') {
  const csv = daysToCsv(days);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
