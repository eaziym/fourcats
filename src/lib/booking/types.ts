/** Outbound channel for a booking draft. */
export type BookingChannel = "email" | "calendly" | "phone" | "manual";

/** Rich payload surfaced in chat after the booking agent runs. */
export type BookingDraft = {
  bookingRequestId: string;
  placeId: string;
  placeName: string;
  channel: BookingChannel;
  status: string;
  requestedService: string;
  requestedTimeWindow: string;
  /** Recipient email when channel is email. */
  toEmail?: string | null;
  subject?: string | null;
  body?: string | null;
  /** Pre-built mailto link — opens the user's email client. */
  mailtoUrl?: string | null;
  /** Online booking URL when available (Calendly, etc.). */
  bookingUrl?: string | null;
  phone?: string | null;
};
