/**
 * Reusable JSON-LD schema constants used by per-page Helmet blocks.
 *
 * All schema lives here as plain JS objects so page components stay readable.
 * Page-component `<Helmet>` blocks render each constant via:
 *   <script type="application/ld+json">{JSON.stringify(SCHEMA_NAME)}</script>
 *
 * Validate at https://validator.schema.org after any edit.
 */

/* -------------------------------------------------------------------------- */
/*                              BreadcrumbList                                */
/* -------------------------------------------------------------------------- */

export const RANGOTSAV_BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://urbanehaauz.com/' },
    { '@type': 'ListItem', position: 2, name: 'Rangotsav', item: 'https://urbanehaauz.com/rangotsav' },
  ],
};

/* -------------------------------------------------------------------------- */
/*                             Event — Rangotsav                              */
/* -------------------------------------------------------------------------- */

/**
 * Assumptions flagged for founder verification:
 *  - Two-day event 2026-05-25 → 2026-05-26, 10:00–22:00 IST each day (timing approximate)
 *  - Location address mirrors hotel NAP (SH-510, Skywalk Road, Upper Pelling)
 *  - eventStatus: EventScheduled (update to EventPostponed/Cancelled if needed)
 *  - offers: ₹100 per Festival Pass, 300-ticket capacity
 */
export const RANGOTSAV_EVENT_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': 'https://urbanehaauz.com/rangotsav#event',
  name: 'Rangotsav · The Tale Of Two States',
  alternateName: 'Rangotsav 2026',
  description:
    "A Bengal-Sikkim cultural conglomerate with art, music, cuisine, and folk performances. Hosted by Urbane Haauz in Upper Pelling, West Sikkim.",
  startDate: '2026-05-25T10:00:00+05:30',
  endDate: '2026-05-26T22:00:00+05:30',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Urbane Haauz',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'SH-510, Skywalk Road, Upper Pelling',
      addressLocality: 'Pelling',
      addressRegion: 'Sikkim',
      postalCode: '737113',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '27.2988033',
      longitude: '88.2271633',
    },
  },
  image: [
    'https://urbanehaauz.com/rangotsav-ganesh.jpeg',
    'https://urbanehaauz.com/og-image.jpg',
  ],
  organizer: {
    '@type': 'Organization',
    name: 'Urbane Haauz',
    url: 'https://urbanehaauz.com',
    '@id': 'https://urbanehaauz.com/#organization',
  },
  performer: {
    '@type': 'PerformingGroup',
    name: 'Bengal-Sikkim Artists Collective',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://urbanehaauz.com/rangotsav#register',
    name: 'Rangotsav Festival Pass',
    price: '100',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-04-01T00:00:00+05:30',
    validThrough: '2026-05-26T22:00:00+05:30',
    inventoryLevel: {
      '@type': 'QuantitativeValue',
      value: 300,
    },
  },
};
