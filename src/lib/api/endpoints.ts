import { apiRequest } from "@/lib/api/client";
import type {
  Address,
  AddressRequest,
  AdminService,
  AdminServiceCategory,
  AdminServiceImage,
  AdminCustomer,
  AdminReportSummary,
  BalanceCollectionRequest,
  Booking,
  AuthLoginResponse,
  OtpSendResponse,
  PaginatedResponse,
  PasswordLoginRequest,
  PasswordSignupRequest,
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
  TechnicianProfile,
  UUID,
  User,
  UserProfileUpdateRequest,
  BookingCreateRequest,
  BookingOperationRequest,
  BookingRescheduleRequest,
  AuditLog,
  FAQ,
  HomepageBanner,
  Lead,
  LeadActivity,
  LeadSummary,
  Notification,
  Payment,
  AdminSettings,
  AdminStaff,
  AdminReview,
  StaffGroup,
} from "@/types/api";

export const apiPaths = {
  health: "/api/v1/health/",
  otpSend: "/api/v1/auth/otp/send/",
  otpVerify: "/api/v1/auth/otp/verify/",
  passwordSignup: "/api/v1/auth/password/signup/",
  passwordLogin: "/api/v1/auth/password/login/",
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
  adminCategories: "/api/v1/admin/service-categories/",
  adminCategoryDetail: (id: UUID) => `/api/v1/admin/service-categories/${id}/`,
  adminServices: "/api/v1/admin/services/",
  adminServiceDetail: (id: UUID) => `/api/v1/admin/services/${id}/`,
  adminServiceImages: (serviceId: UUID) => `/api/v1/admin/services/${serviceId}/images/`,
  adminServiceImageDetail: (serviceId: UUID, imageId: UUID) => `/api/v1/admin/services/${serviceId}/images/${imageId}/`,
  adminBookings: "/api/v1/admin/bookings/",
  adminBookingDetail: (id: UUID) => `/api/v1/admin/bookings/${id}/`,
  adminBookingAssignTechnician: (id: UUID) => `/api/v1/admin/bookings/${id}/assign-technician/`,
  adminBookingRemoveTechnician: (id: UUID) => `/api/v1/admin/bookings/${id}/remove-technician/`,
  adminBookingStart: (id: UUID) => `/api/v1/admin/bookings/${id}/start/`,
  adminBookingComplete: (id: UUID) => `/api/v1/admin/bookings/${id}/complete/`,
  adminBookingCancel: (id: UUID) => `/api/v1/admin/bookings/${id}/cancel/`,
  adminBookingRecordBalance: (id: UUID) => `/api/v1/admin/bookings/${id}/record-balance/`,
  adminTechnicians: "/api/v1/admin/technicians/",
  adminLeads: "/api/v1/admin/leads/",
  adminLeadDetail: (id: UUID) => `/api/v1/admin/leads/${id}/`,
  adminLeadConvert: (id: UUID) => `/api/v1/admin/leads/${id}/convert-to-booking/`,
  adminLeadActivities: (id: UUID) => `/api/v1/admin/leads/${id}/activities/`,
  adminLeadSummary: "/api/v1/admin/leads/summary/",
  adminLeadSendPaymentLink: (id: UUID) => `/api/v1/admin/leads/${id}/send-payment-link/`,
  adminLeadRecordContact: (id: UUID) => `/api/v1/admin/leads/${id}/record-contact/`,
  adminLeadRecordManualPayment: (id: UUID) => `/api/v1/admin/leads/${id}/record-manual-payment/`,
  adminCustomers: "/api/v1/admin/customers/",
  adminCustomerDetail: (id: UUID) => `/api/v1/admin/customers/${id}/`,
  adminCustomerSupportNotes: (id: UUID) => `/api/v1/admin/customers/${id}/support-notes/`,
  adminPayments: "/api/v1/admin/payments/",
  adminPaymentAdvanceOrder: (bookingId: UUID) => `/api/v1/admin/payments/booking/${bookingId}/advance-order/`,
  adminNotifications: "/api/v1/admin/notifications/",
  adminNotificationCancel: (id: UUID) => `/api/v1/admin/notifications/${id}/cancel/`,
  adminNotificationRetry: (id: UUID) => `/api/v1/admin/notifications/${id}/retry/`,
  adminNotificationSend: (id: UUID) => `/api/v1/admin/notifications/${id}/send/`,
  adminFaqs: "/api/v1/admin/faqs/",
  adminFaqDetail: (id: UUID) => `/api/v1/admin/faqs/${id}/`,
  adminHomepageBanners: "/api/v1/admin/homepage-banners/",
  adminHomepageBannerDetail: (id: UUID) => `/api/v1/admin/homepage-banners/${id}/`,
  adminReportsSummary: "/api/v1/admin/reports/summary/",
  adminStaff: "/api/v1/admin/staff/",
  adminStaffDetail: (id: UUID) => `/api/v1/admin/staff/${id}/`,
  adminStaffGroups: "/api/v1/admin/staff-groups/",
  adminAuditLogs: "/api/v1/admin/audit-logs/",
  adminSettings: "/api/v1/admin/settings/",
  adminReviews: "/api/v1/admin/reviews/",
  adminReviewDetail: (id: UUID) => `/api/v1/admin/reviews/${id}/`,
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
  passwordSignup: (body: PasswordSignupRequest) =>
    apiRequest<AuthLoginResponse>(apiPaths.passwordSignup, {
      method: "POST",
      body,
    }),
  passwordLogin: (body: PasswordLoginRequest) =>
    apiRequest<AuthLoginResponse>(apiPaths.passwordLogin, {
      method: "POST",
      body,
    }),
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

export const adminApi = {
  listCategories: () => apiRequest<PaginatedResponse<AdminServiceCategory>>(apiPaths.adminCategories, { auth: true }),
  createCategory: (body: FormData | Partial<AdminServiceCategory>) =>
    apiRequest<AdminServiceCategory>(apiPaths.adminCategories, {
      method: "POST",
      body,
      auth: true,
    }),
  updateCategory: (id: UUID, body: FormData | Partial<AdminServiceCategory>) =>
    apiRequest<AdminServiceCategory>(apiPaths.adminCategoryDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  removeCategory: (id: UUID) =>
    apiRequest<void>(apiPaths.adminCategoryDetail(id), {
      method: "DELETE",
      auth: true,
    }),
  listServices: (query?: { page?: number; page_size?: number }) =>
    apiRequest<PaginatedResponse<AdminService>>(apiPaths.adminServices, { auth: true, query }),
  createService: (body: FormData | Partial<AdminService>) =>
    apiRequest<AdminService>(apiPaths.adminServices, {
      method: "POST",
      body,
      auth: true,
    }),
  updateService: (id: UUID, body: FormData | Partial<AdminService>) =>
    apiRequest<AdminService>(apiPaths.adminServiceDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  removeService: (id: UUID) =>
    apiRequest<void>(apiPaths.adminServiceDetail(id), {
      method: "DELETE",
      auth: true,
    }),
  addServiceImage: (serviceId: UUID, body: FormData) =>
    apiRequest<AdminServiceImage>(apiPaths.adminServiceImages(serviceId), {
      method: "POST",
      body,
      auth: true,
    }),
  removeServiceImage: (serviceId: UUID, imageId: UUID) =>
    apiRequest<void>(apiPaths.adminServiceImageDetail(serviceId, imageId), {
      method: "DELETE",
      auth: true,
    }),
  listBookings: (query?: { page?: number; page_size?: number; status?: string; search?: string }) =>
    apiRequest<PaginatedResponse<Booking>>(apiPaths.adminBookings, { auth: true, query }),
  assignTechnician: (bookingId: UUID, body: { technician_id: UUID; notes?: string; reason?: string }) =>
    apiRequest<Booking>(apiPaths.adminBookingAssignTechnician(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  removeTechnician: (bookingId: UUID, body: { notes?: string } = {}) =>
    apiRequest<Booking>(apiPaths.adminBookingRemoveTechnician(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  startBooking: (bookingId: UUID, body: BookingOperationRequest = {}) =>
    apiRequest<Booking>(apiPaths.adminBookingStart(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  completeBooking: (bookingId: UUID, body: BookingOperationRequest = {}) =>
    apiRequest<Booking>(apiPaths.adminBookingComplete(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  cancelBooking: (bookingId: UUID, body: BookingOperationRequest = {}) =>
    apiRequest<Booking>(apiPaths.adminBookingCancel(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  recordBalance: (bookingId: UUID, body: BalanceCollectionRequest) =>
    apiRequest<Booking>(apiPaths.adminBookingRecordBalance(bookingId), {
      method: "POST",
      body,
      auth: true,
    }),
  listTechnicians: (query?: { booking_id?: UUID }) => apiRequest<TechnicianProfile[]>(apiPaths.adminTechnicians, { auth: true, query }),
  listLeads: (query?: {
    page?: number;
    page_size?: number;
    status?: string;
    funnel_status?: string;
    payment_status?: string;
    source?: string;
    assigned_to?: UUID;
    service?: UUID;
    created_from?: string;
    created_to?: string;
    follow_up_date?: string;
    ordering?: string;
    search?: string;
  }) =>
    apiRequest<PaginatedResponse<Lead>>(apiPaths.adminLeads, { auth: true, query }),
  getLead: (id: UUID) => apiRequest<Lead>(apiPaths.adminLeadDetail(id), { auth: true }),
  getLeadSummary: () => apiRequest<LeadSummary>(apiPaths.adminLeadSummary, { auth: true }),
  listLeadActivities: (id: UUID) => apiRequest<LeadActivity[]>(apiPaths.adminLeadActivities(id), { auth: true }),
  createLead: (body: Partial<Lead>) =>
    apiRequest<Lead>(apiPaths.adminLeads, {
      method: "POST",
      body,
      auth: true,
    }),
  updateLead: (id: UUID, body: Partial<Lead>) =>
    apiRequest<Lead>(apiPaths.adminLeadDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  convertLead: (id: UUID, body: { booking_id: UUID; notes?: string }) =>
    apiRequest<Lead>(apiPaths.adminLeadConvert(id), {
      method: "POST",
      body,
      auth: true,
    }),
  sendLeadPaymentLink: (id: UUID, body: { channel: "SMS" | "WHATSAPP" }) =>
    apiRequest<Lead & { payment_link_created?: boolean }>(apiPaths.adminLeadSendPaymentLink(id), {
      method: "POST",
      body,
      auth: true,
    }),
  recordLeadContact: (id: UUID, body: { note: string; next_follow_up_at?: string }) =>
    apiRequest<Lead>(apiPaths.adminLeadRecordContact(id), {
      method: "POST",
      body,
      auth: true,
    }),
  recordLeadManualPayment: (
    id: UUID,
    body: { amount: string; method: "MANUAL_CASH" | "MANUAL_UPI" | "MANUAL_CARD" | "MANUAL_BANK_TRANSFER"; reference?: string; payment_date: string; note?: string; confirm: boolean },
  ) =>
    apiRequest<Lead>(apiPaths.adminLeadRecordManualPayment(id), {
      method: "POST",
      body,
      auth: true,
    }),
  listCustomers: (query?: { page?: number; page_size?: number; search?: string }) =>
    apiRequest<PaginatedResponse<AdminCustomer>>(apiPaths.adminCustomers, { auth: true, query }),
  getCustomer: (id: UUID) => apiRequest<AdminCustomer>(apiPaths.adminCustomerDetail(id), { auth: true }),
  addCustomerSupportNote: (id: UUID, body: { note: string }) =>
    apiRequest(apiPaths.adminCustomerSupportNotes(id), {
      method: "POST",
      body,
      auth: true,
    }),
  listPayments: (query?: { page?: number; page_size?: number; status?: string; payment_type?: string; search?: string }) =>
    apiRequest<PaginatedResponse<Payment>>(apiPaths.adminPayments, { auth: true, query }),
  createPaymentLink: (bookingId: UUID) =>
    apiRequest<PaymentOrder>(apiPaths.adminPaymentAdvanceOrder(bookingId), {
      method: "POST",
      auth: true,
    }),
  listNotifications: (query?: { page?: number; page_size?: number; status?: string; event?: string; channel?: string; search?: string }) =>
    apiRequest<PaginatedResponse<Notification>>(apiPaths.adminNotifications, { auth: true, query }),
  retryNotification: (id: UUID) =>
    apiRequest<Notification>(apiPaths.adminNotificationRetry(id), {
      method: "POST",
      body: {},
      auth: true,
    }),
  cancelNotification: (id: UUID, reason?: string) =>
    apiRequest<Notification>(apiPaths.adminNotificationCancel(id), {
      method: "POST",
      body: { reason },
      auth: true,
    }),
  listFaqs: (query?: { page?: number; page_size?: number; search?: string }) =>
    apiRequest<PaginatedResponse<FAQ>>(apiPaths.adminFaqs, { auth: true, query }),
  createFaq: (body: Partial<FAQ>) =>
    apiRequest<FAQ>(apiPaths.adminFaqs, {
      method: "POST",
      body,
      auth: true,
    }),
  updateFaq: (id: UUID, body: Partial<FAQ>) =>
    apiRequest<FAQ>(apiPaths.adminFaqDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  removeFaq: (id: UUID) =>
    apiRequest<void>(apiPaths.adminFaqDetail(id), {
      method: "DELETE",
      auth: true,
    }),
  listHomepageBanners: (query?: { page?: number; page_size?: number; placement?: string; is_active?: boolean }) =>
    apiRequest<PaginatedResponse<HomepageBanner>>(apiPaths.adminHomepageBanners, { auth: true, query }),
  createHomepageBanner: (body: FormData) =>
    apiRequest<HomepageBanner>(apiPaths.adminHomepageBanners, {
      method: "POST",
      body,
      auth: true,
    }),
  updateHomepageBanner: (id: UUID, body: FormData | Partial<HomepageBanner>) =>
    apiRequest<HomepageBanner>(apiPaths.adminHomepageBannerDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  removeHomepageBanner: (id: UUID) =>
    apiRequest<void>(apiPaths.adminHomepageBannerDetail(id), {
      method: "DELETE",
      auth: true,
    }),
  getReportsSummary: (query?: { date_from?: string; date_to?: string }) =>
    apiRequest<AdminReportSummary>(apiPaths.adminReportsSummary, { auth: true, query }),
  listStaff: (query?: { page?: number; page_size?: number; search?: string; role?: string }) =>
    apiRequest<PaginatedResponse<AdminStaff>>(apiPaths.adminStaff, { auth: true, query }),
  updateStaff: (id: UUID, body: Partial<AdminStaff>) =>
    apiRequest<AdminStaff>(apiPaths.adminStaffDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
  listStaffGroups: () => apiRequest<StaffGroup[]>(apiPaths.adminStaffGroups, { auth: true }),
  listAuditLogs: (query?: { page?: number; page_size?: number; action?: string; resource_type?: string; search?: string }) =>
    apiRequest<PaginatedResponse<AuditLog>>(apiPaths.adminAuditLogs, { auth: true, query }),
  getSettings: () => apiRequest<AdminSettings>(apiPaths.adminSettings, { auth: true }),
  listReviews: (query?: { page?: number; page_size?: number; search?: string; is_visible?: boolean }) =>
    apiRequest<PaginatedResponse<AdminReview>>(apiPaths.adminReviews, { auth: true, query }),
  updateReview: (id: UUID, body: Partial<AdminReview>) =>
    apiRequest<AdminReview>(apiPaths.adminReviewDetail(id), {
      method: "PATCH",
      body,
      auth: true,
    }),
};
