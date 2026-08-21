import type {
  Booking,
  BookingCreateRequest,
  BookingOperationRequest,
  BookingRescheduleRequest,
  BookingStatus,
  DecimalString,
  PaymentStatus,
  TimeSlot,
  UUID,
} from "@/types/api";

export type {
  Booking,
  BookingCreateRequest,
  BookingOperationRequest,
  BookingRescheduleRequest,
  BookingStatus,
  DecimalString,
  PaymentStatus,
  TimeSlot,
  UUID,
};

export type BookingDraft = {
  serviceSlug: string;
  serviceId?: string;
  addressId?: string;
  selectedDate?: string;
  slotId?: string;
};

export type BookingServiceSnapshot = {
  id?: string;
  name?: string;
  slug?: string;
  estimated_duration_minutes?: number;
  duration_minutes?: number;
  price?: string | number;
  effective_price?: string | number;
  base_price?: string | number;
};

export type BookingAddressSnapshot = {
  label?: string;
  recipient_name?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};
