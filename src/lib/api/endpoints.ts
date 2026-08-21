import { apiRequest } from "@/lib/api/client";
import type {
  Address,
  AddressRequest,
  Booking,
  AuthLoginResponse,
  OtpSendResponse,
  PaginatedResponse,
  PaymentOrder,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  Review,
  ReviewCreateRequest,
  ServiceAreaCheckResponse,
  ServiceCategory,
  ServiceDetail,
  ServiceListItem,
  TimeSlot,
  TokenRefreshResponse,
  UUID,
  User,
  UserProfileUpdateRequest,
  BookingCreateRequest,
  BookingOperationRequest,
  BookingRescheduleRequest,
} from "@/types/api";

export const apiPaths = {
  health: "/api/v1/health/",
  otpSend: "/api/v1/auth/otp/send/",
  otpVerify: "/api/v1/auth/otp/verify/",
  devPhoneAuth: "/api/v1/auth/dev-phone/",
  refreshAuth: "/api/v1/auth/refresh/",
  logout: "/api/v1/auth/logout/",
  me: "/api/v1/auth/me/",
  serviceAreaCheck: "/api/v1/service-areas/check/",
  serviceCategories: "/api/v1/service-categories/",
  services: "/api/v1/services/",
  serviceDetail: (slug: string) => `/api/v1/services/${slug}/`,
  serviceReviews: (serviceId: UUID) => `/api/v1/services/${serviceId}/reviews/`,
  addresses: "/api/v1/addresses/",
  addressDetail: (id: UUID) => `/api/v1/addresses/${id}/`,
  slots: "/api/v1/slots/",
  bookings: "/api/v1/bookings/",
  bookingDetail: (id: UUID) => `/api/v1/bookings/${id}/`,
  cancelBooking: (id: UUID) => `/api/v1/bookings/${id}/cancel/`,
  rescheduleBooking: (id: UUID) => `/api/v1/bookings/${id}/reschedule/`,
  paymentOrder: (bookingId: UUID) => `/api/v1/bookings/${bookingId}/payments/order/`,
  verifyPayment: "/api/v1/payments/verify/",
  createReview: (bookingId: UUID) => `/api/v1/bookings/${bookingId}/review/`,
};

export const catalogueApi = {
  listCategories: () => apiRequest<ServiceCategory[]>(apiPaths.serviceCategories, { cache: "no-store" }),
  listServices: (query?: { category?: string; search?: string; featured?: boolean; page?: number; page_size?: number }) =>
    apiRequest<PaginatedResponse<ServiceListItem>>(apiPaths.services, { query }),
  getService: (slug: string) => apiRequest<ServiceDetail>(apiPaths.serviceDetail(slug)),
  listServiceReviews: (serviceId: UUID) =>
    apiRequest<PaginatedResponse<Review>>(apiPaths.serviceReviews(serviceId), { query: { page_size: 3 } }),
  checkServiceArea: (postalCode: string) =>
    apiRequest<ServiceAreaCheckResponse>(apiPaths.serviceAreaCheck, { query: { postal_code: postalCode } }),
};

export const addressApi = {
  list: () => apiRequest<PaginatedResponse<Address>>(apiPaths.addresses, { auth: true }),
  create: (body: AddressRequest) =>
    apiRequest<Address>(apiPaths.addresses, {
      method: "POST",
      body,
      auth: true,
    }),
  update: (id: UUID, body: Partial<AddressRequest>) =>
    apiRequest<Address>(apiPaths.addressDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  remove: (id: UUID) =>
    apiRequest<void>(apiPaths.addressDetail(id), {
      method: "DELETE",
      auth: true,
    }),
};

export const slotApi = {
  list: (query: { date: string; postal_code: string; service_id: string }) =>
    apiRequest<TimeSlot[]>(apiPaths.slots, { query }),
};

export const bookingApi = {
  list: (query?: { page?: number; page_size?: number }) => apiRequest<PaginatedResponse<Booking>>(apiPaths.bookings, { auth: true, query }),
  get: (id: UUID) => apiRequest<Booking>(apiPaths.bookingDetail(id), { auth: true }),
  create: (body: BookingCreateRequest) =>
    apiRequest<Booking>(apiPaths.bookings, {
      method: "POST",
      body,
      auth: true,
    }),
  cancel: (id: UUID, body: BookingOperationRequest = {}) =>
    apiRequest<Booking>(apiPaths.cancelBooking(id), {
      method: "POST",
      body,
      auth: true,
    }),
  reschedule: (id: UUID, body: BookingRescheduleRequest) =>
    apiRequest<Booking>(apiPaths.rescheduleBooking(id), {
      method: "POST",
      body,
      auth: true,
    }),
};

export const reviewApi = {
  createForBooking: (bookingId: UUID, body: ReviewCreateRequest) =>
    apiRequest<Review>(apiPaths.createReview(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
};

export const paymentApi = {
  createAdvanceOrder: (bookingId: UUID) =>
    apiRequest<PaymentOrder>(apiPaths.paymentOrder(bookingId), {
      method: "POST",
      auth: true,
    }),
  verify: (body: PaymentVerifyRequest) =>
    apiRequest<PaymentVerifyResponse>(apiPaths.verifyPayment, {
      method: "POST",
      body,
      auth: true,
    }),
};

export const authApi = {
  devPhoneLogin: (phoneNumber: string) =>
    apiRequest<AuthLoginResponse>(apiPaths.devPhoneAuth, {
      method: "POST",
      body: { phone_number: phoneNumber },
    }),
  sendOtp: (phoneNumber: string) =>
    apiRequest<OtpSendResponse>(apiPaths.otpSend, {
      method: "POST",
      body: { phone_number: phoneNumber },
    }),
  verifyOtp: (phoneNumber: string, otp: string) =>
    apiRequest<AuthLoginResponse>(apiPaths.otpVerify, {
      method: "POST",
      body: { phone_number: phoneNumber, otp },
    }),
  me: () => apiRequest<User>(apiPaths.me, { auth: true }),
  updateMe: (body: UserProfileUpdateRequest) =>
    apiRequest<User>(apiPaths.me, {
      method: "PATCH",
      body,
      auth: true,
    }),
  refresh: (refresh: string) =>
    apiRequest<TokenRefreshResponse>(apiPaths.refreshAuth, {
      method: "POST",
      body: { refresh },
      skipAuthRefresh: true,
    }),
  logout: (refresh: string) =>
    apiRequest<void>(apiPaths.logout, {
      method: "POST",
      body: { refresh },
      auth: true,
      skipAuthRefresh: true,
    }),
};
