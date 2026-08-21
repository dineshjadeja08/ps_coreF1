export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;
export type TimeString = string;
export type DecimalString = string;

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ServiceCategory = {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
};

export type ServiceAreaCheckResponse = {
  postal_code: string;
  is_supported: boolean;
  service_area: Record<string, unknown> | null;
};

export type Review = {
  id: UUID;
  booking: UUID;
  customer: Record<string, unknown>;
  technician: Record<string, unknown>;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type ReviewCreateRequest = {
  rating: number;
  comment: string;
};

export type ServiceListItem = {
  id: UUID;
  category: ServiceCategory;
  name: string;
  slug: string;
  short_description: string;
  base_price: DecimalString;
  selling_price: DecimalString | null;
  effective_price: number;
  advance_amount: DecimalString;
  estimated_duration_minutes: number;
  cover_image: string;
  is_featured: boolean;
  is_popular: boolean;
  display_order: number;
};

export type ServiceDetail = ServiceListItem & {
  description?: string;
  whats_included?: string;
  whats_excluded?: string;
  important_notes?: string;
};

export type Address = {
  id: UUID;
  label: string;
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  locality?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  latitude?: string | null;
  longitude?: string | null;
  is_default: boolean;
};

export type AddressRequest = {
  label: string;
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  locality?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  latitude?: string | null;
  longitude?: string | null;
  is_default?: boolean;
};

export type TimeSlot = {
  id: UUID;
  service_area: UUID;
  date: ISODate;
  start_time: TimeString;
  end_time: TimeString;
  capacity: number;
  available_capacity: number;
};

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "TECHNICIAN_ASSIGNED"
  | "TECHNICIAN_EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type Booking = {
  id: UUID;
  booking_number: string;
  service: Record<string, unknown>;
  address_snapshot: unknown;
  service_date: ISODate;
  time_slot: Record<string, unknown>;
  problem_description: string;
  subtotal: DecimalString;
  discount_amount: DecimalString;
  tax_amount: DecimalString;
  total_amount: DecimalString;
  advance_required: DecimalString;
  advance_paid: DecimalString;
  balance_due: DecimalString;
  balance_collected: DecimalString;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  customer_notes?: string;
  admin_notes?: string;
  confirmed_at: ISODateTime | null;
  completed_at: ISODateTime | null;
  cancelled_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  status_history: BookingStatusHistory[];
};

export type BookingStatusHistory = {
  id: UUID;
  from_status?: string;
  to_status: string;
  notes?: string;
  created_at: ISODateTime;
};

export type BookingCreateRequest = {
  service_id: UUID;
  address_id: UUID;
  slot_id: UUID;
  problem_description: string;
  customer_notes?: string;
};

export type BookingOperationRequest = {
  notes?: string;
};

export type BookingRescheduleRequest = {
  slot_id: UUID;
  notes?: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
  token_type: string;
};

export type PaymentOrder = {
  payment_id: UUID;
  booking_id: UUID;
  provider_order_id: string;
  amount: DecimalString;
  amount_paise: number;
  currency: string;
  key_id: string;
};

export type PaymentVerifyRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type PaymentVerifyResponse = {
  payment_id: UUID;
  booking_id: UUID;
  payment_status: string;
  booking_status: string;
};

export type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN";

export type CustomerProfile = {
  id: UUID;
  display_name?: string;
  alternate_phone?: string;
};

export type User = {
  id: UUID;
  phone_number: string;
  email: string | null;
  first_name: string;
  last_name: string;
  role: Role;
  is_verified: boolean;
  customer_profile: CustomerProfile;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type UserProfileUpdateRequest = {
  first_name?: string;
  last_name?: string;
  email?: string | null;
  display_name?: string;
  alternate_phone?: string;
};

export type AuthLoginResponse = {
  user: User;
  tokens: TokenPair;
  created: boolean;
};

export type OtpSendResponse = {
  phone_number: string;
  request_id: string;
};

export type TokenRefreshResponse = {
  access: string;
};
