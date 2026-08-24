# Purple Squad UI Audit

| Current UI issue | CivyTown-inspired improvement | Purple Squad treatment | Components affected |
| --- | --- | --- | --- |
| Header search and location are useful but visually plain. | Marketplace-style compact sticky header with clear location and central service search. | Purple focus rings, PS brand badge, softer border. | `Header`, `Brand`, `Input`, `Button` |
| Homepage hero reads more like a product intro than a service marketplace. | Service-first hero with fast CTAs, search, location, and a visual technician/service panel. | Purple Squad Care badges and purple accent panels. | `HomeDiscovery`, `LocationSelector`, `ServiceSearch` |
| Category cards are text-led. | Compact image/icon tiles optimized for scanning. | Branded purple icon tile and short copy. | `CategoryCard` |
| Service cards contain too much equal-weight information. | Image first, then name, one-line description, duration, price, CTA. | PS Verified badge and purple booking CTA. | `ServiceCard`, `ServiceImage`, `PriceDisplay` |
| Service listing top area feels like a documentation page. | Search, category chips, and result count first. | Purple page header and marketplace filters. | `ServicesListing`, `CategoryFilter` |
| Service detail CTA is good but can feel more premium. | Large visual plus sticky purchase-style service summary. | Purple Squad verified trust cue. | `ServiceDetailView` |
| Booking cards and summaries are functional but boxy. | Checkout-style two-column layout with compact selectable cards. | Purple selected states, secure booking badges. | Booking scheduling/review/payment/success components |
| Account and bookings pages are utilitarian. | Clear account sections, status badges, and scan-friendly booking cards. | Purple status/timeline accents. | `BookingsListScreen`, `BookingDetailScreen`, `ProfilePage` |

