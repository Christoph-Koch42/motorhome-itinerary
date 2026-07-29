export type ActivityType = 'travel' | 'stay';

export type OvernightType =
  | 'campground'
  | 'aire'
  | 'parking'
  | 'wildcamp'
  | 'other';

export type BookingStatus =
  | 'planned'
  | 'requested'
  | 'not_possible'
  | 'confirmed';

export interface DayEntry {
  id: string;
  date: string; // ISO date, e.g. 2026-08-04
  activityType: ActivityType;
  activityTitle: string;
  km: number | null;
  overnightPlace: string;
  overnightType: OvernightType;
  mapsLink: string;
  bookingStatus: BookingStatus;
  price: number | null;
  hookup: boolean;
  water: boolean;
  dump: boolean;
  highlights: string;
}

export const OVERNIGHT_TYPE_LABELS: Record<OvernightType, string> = {
  campground: 'Campground',
  aire: 'Aire / Stellplatz',
  parking: 'Parking lot',
  wildcamp: 'Wild camping',
  other: 'Other',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  planned: 'Planned',
  requested: 'Reservation requested',
  not_possible: 'Reservation not possible',
  confirmed: 'Reservation confirmed',
};
