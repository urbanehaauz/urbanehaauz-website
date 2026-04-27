import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, Check, Mountain, Sparkles, Bed } from 'lucide-react';

/**
 * Urbane Haauz offers three accommodation types:
 *   - Premium Room (direct Kanchenjunga view, private balcony)
 *   - Super Deluxe Room (partial mountain view)
 *   - Dormitory Bed (shared, only boutique hotel in Upper Pelling with this option)
 *
 * The page is intentionally text-only (no pictures, no prices).
 * Pricing is handled at /book where live availability + seasonal rates apply.
 */

type RoomType = {
  id: 'premium' | 'super-deluxe' | 'dorm';
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  maxOccupancy: string;
  amenities: string[];
  view: string;
};

const ROOM_TYPES: RoomType[] = [
  {
    id: 'premium',
    name: 'Premium Room',
    tagline: 'Direct Kanchenjunga view from your own balcony',
    icon: Mountain,
    description:
      "Our signature rooms, north-west facing, with a private balcony that looks directly onto the Kanchenjunga range. These are the best sunrise rooms in the property — clearest views October through March.",
    maxOccupancy: 'Up to 3 guests',
    view: 'Direct, from private balcony',
    amenities: [
      'Private Kanchenjunga-view balcony',
      'King bed + seating area',
      'Attached bathroom, 24-hour hot water',
      'Free WiFi + power backup',
      'Daily housekeeping',
      'Room service',
    ],
  },
  {
    id: 'super-deluxe',
    name: 'Super Deluxe Room',
    tagline: 'Spacious, light-filled, partial mountain view',
    icon: Sparkles,
    description:
      "Larger than our standard category, with upgraded furnishings and partial Kanchenjunga view from the room window. A comfortable mid-tier choice for families and longer stays.",
    maxOccupancy: 'Up to 3 guests',
    view: 'Partial, from room window',
    amenities: [
      'Partial Kanchenjunga view',
      'King bed + seating area',
      'Attached bathroom, 24-hour hot water',
      'Free WiFi + power backup',
      'Daily housekeeping',
      'Room service',
    ],
  },
  {
    id: 'dorm',
    name: 'Dormitory Bed',
    tagline: 'The only boutique hotel in Upper Pelling offering dorm beds',
    icon: Bed,
    description:
      "Shared dormitory accommodation for solo travellers, backpackers, and budget-conscious groups. Every dorm guest gets full access to the same Kanchenjunga-view common areas as private-room guests.",
    maxOccupancy: '1 per bed',
    view: 'From shared common areas',
    amenities: [
      'Private locker',
      'Shared bathroom, 24-hour hot water',
      'Free WiFi + power backup',
      'Access to Kanchenjunga-view common lounge',
      'Bunk bed with linen',
      'Luggage storage',
    ],
  },
];

const ROOMS_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HotelRoom',
      '@id': 'https://urbanehaauz.com/rooms#premium',
      name: 'Premium Room',
      description:
        'Premium room at Urbane Haauz with direct, unobstructed Kanchenjunga view from a private balcony. The best sunrise rooms in the property. King bed, seating area, upgraded bath.',
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'King bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Private Balcony', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Direct Kanchenjunga View', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      ],
      url: 'https://urbanehaauz.com/book',
    },
    {
      '@type': 'HotelRoom',
      '@id': 'https://urbanehaauz.com/rooms#super-deluxe',
      name: 'Super Deluxe Room',
      description:
        'Spacious Super Deluxe room at Urbane Haauz with partial Kanchenjunga mountain view, larger windows, and upgraded furnishings. Attached bathroom, free WiFi, seating area.',
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'King bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Partial Kanchenjunga View', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Seating Area', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      ],
      url: 'https://urbanehaauz.com/book',
    },
    {
      '@type': 'Accommodation',
      '@id': 'https://urbanehaauz.com/rooms#dorm',
      name: 'Dormitory Bed',
      description:
        'Shared dormitory accommodation at Urbane Haauz, Upper Pelling — the only boutique hotel in Pelling offering dorm beds. Lockers, shared bathroom, free WiFi, and access to the same Kanchenjunga-view common areas as private rooms.',
      occupancy: { '@type': 'QuantitativeValue', value: 1 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'Dorm bunk bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Lockers', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Shared Bathroom', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: '24-hour Hot Water', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Common Area with Kanchenjunga View', value: true },
      ],
      url: 'https://urbanehaauz.com/book',
    },
  ],
};

const ROOMS_BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://urbanehaauz.com/' },
    { '@type': 'ListItem', position: 2, name: 'Rooms & Dorms', item: 'https://urbanehaauz.com/rooms' },
  ],
};

const ROOMS_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://urbanehaauz.com/rooms#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What room types does Urbane Haauz offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Urbane Haauz offers three accommodation types: Premium rooms (direct Kanchenjunga view from a private balcony), Super Deluxe rooms (partial mountain view), and dormitory beds (shared, with access to the same Kanchenjunga-view common areas as private-room guests).',
      },
    },
    {
      '@type': 'Question',
      name: 'Which room at Urbane Haauz has the best Kanchenjunga view?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Premium rooms have direct, unobstructed Kanchenjunga views from a private balcony — the best sunrise rooms in the property. Super Deluxe rooms have partial mountain views from the room window. Dorm guests access the shared Kanchenjunga-view common areas.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are dorm beds available at Urbane Haauz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Urbane Haauz is the only boutique property in Upper Pelling offering dorm beds alongside private hotel rooms. Dorm beds include lockers, a shared hot-water bathroom, free WiFi, and access to the same Kanchenjunga-view common areas as private-room guests.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the room rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All stays include free WiFi, 24-hour hot water, daily housekeeping, and power backup. Guests can upgrade to CP (breakfast included) or MAP (breakfast + dinner) meal plans at booking. Airport / station pickup is available on request for an additional charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I book a room at Urbane Haauz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Book any category — Premium, Super Deluxe, or Dorm bed — directly at urbanehaauz.com/book with instant Razorpay confirmation and best-rate guarantee (no OTA commission). For multi-room family bookings or groups, WhatsApp +91 9136032524.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do the rooms have reliable power and hot water?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every room at Urbane Haauz runs on 24/7 inverter backup with a dedicated solar-assisted hot-water system, so power and hot water remain available even during the monsoon storms that occasionally affect the wider Pelling grid. Older online reviews mentioning power or hot-water issues predate our current backup setup.',
      },
    },
  ],
};

const Rooms: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-urbane-mist">
      <Helmet>
        <title>Rooms & Dorms in Pelling | Urbane Haauz Boutique Hotel</title>
        <meta
          name="description"
          content="Premium, Super Deluxe and Dormitory accommodation at Urbane Haauz in Upper Pelling. Direct Kanchenjunga views, CP/MAP meal plans, free WiFi, 24-hour hot water."
        />
        <link rel="canonical" href="https://urbanehaauz.com/rooms" />
        <meta property="og:title" content="Rooms & Dorms | Urbane Haauz Pelling" />
        <meta property="og:description" content="Premium, Super Deluxe and Dorm accommodation in Upper Pelling with Kanchenjunga views." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/rooms" />
        <script type="application/ld+json">{JSON.stringify(ROOMS_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(ROOMS_BREADCRUMB_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(ROOMS_FAQ_JSONLD)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-urbane-gold uppercase tracking-[0.3em] text-xs font-semibold">Accommodation</span>
          <h1 className="font-serif text-4xl md:text-5xl text-urbane-green font-bold mt-3 mb-4">
            <span aria-hidden="true">Three ways to stay</span>
            <span className="sr-only">Rooms & Dorms in Pelling, Sikkim — Kanchenjunga View Stays at Urbane Haauz</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From backpacker dorms to premium suites with direct Kanchenjunga views. Pick the stay that fits —
            and book with confirmed availability and best-rate guarantee.
          </p>
        </div>

        {/* Room Types at a Glance — GEO block for AI engines, pictures & prices intentionally omitted */}
        <section
          aria-labelledby="rooms-glance-heading"
          className="bg-white border-l-4 border-urbane-gold shadow-soft p-6 md:p-8 mb-14"
        >
          <h2 id="rooms-glance-heading" className="font-serif text-2xl md:text-3xl text-urbane-charcoal font-bold mb-5">
            Room Types at a Glance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-urbane-mist text-urbane-charcoal">
                  <th className="py-3 pr-4 font-bold uppercase tracking-wider text-xs">Room Type</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Max Occupancy</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Kanchenjunga View</th>
                  <th className="py-3 pl-4 font-bold uppercase tracking-wider text-xs">Bed</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-semibold">Premium Room</td>
                  <td className="py-3 px-4">3 guests</td>
                  <td className="py-3 px-4">Direct, from private balcony</td>
                  <td className="py-3 pl-4">King</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-semibold">Super Deluxe</td>
                  <td className="py-3 px-4">3 guests</td>
                  <td className="py-3 px-4">Partial, from room window</td>
                  <td className="py-3 pl-4">King</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold">Dormitory Bed</td>
                  <td className="py-3 px-4">1 per bed</td>
                  <td className="py-3 px-4">From shared common areas</td>
                  <td className="py-3 pl-4">Bunk</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-6 space-y-2 text-gray-600 text-sm">
            <li>
              <strong className="text-urbane-charcoal">Dorm beds:</strong> the only boutique hotel in Upper Pelling
              offering shared dormitory accommodation alongside private rooms.
            </li>
            <li>
              <strong className="text-urbane-charcoal">Meal plans:</strong> CP (breakfast included) and MAP (breakfast +
              dinner) available at booking. EP (room only) is the default.
            </li>
            <li>
              <strong className="text-urbane-charcoal">Best view rooms:</strong> Premium category — private north-west-facing
              balcony with direct Kanchenjunga view at sunrise (clearest October–March).
            </li>
            <li>
              <strong className="text-urbane-charcoal">Direct booking:</strong> Instant confirmation on our{' '}
              <a
                href="https://urbanehaauz.runhotel.site/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-urbane-green font-semibold underline-offset-4 hover:underline"
              >
                official booking page
              </a>{' '}
              — no OTA markup, best-rate guaranteed.
            </li>
          </ul>
        </section>

        {/* 3-up text cards, no imagery, no prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {ROOM_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <article
                key={type.id}
                className="bg-white rounded-xl border border-gray-100 shadow-soft hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-urbane-gold/10 flex items-center justify-center">
                      <Icon className="text-urbane-gold" size={20} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-urbane-gold">
                      {type.id === 'dorm' ? 'Shared' : 'Private'}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl text-urbane-charcoal font-bold leading-tight">{type.name}</h2>
                  <p className="text-gray-500 text-sm italic mt-2">{type.tagline}</p>
                </div>

                <div className="px-7 py-5 flex-grow flex flex-col">
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{type.description}</p>

                  <dl className="text-sm text-gray-600 mb-5 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <dt className="text-[10px] uppercase tracking-widest font-bold text-gray-400 w-20 shrink-0">View</dt>
                      <dd>{type.view}</dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="text-[10px] uppercase tracking-widest font-bold text-gray-400 w-20 shrink-0">Sleeps</dt>
                      <dd>{type.maxOccupancy}</dd>
                    </div>
                  </dl>

                  <ul className="text-sm text-gray-600 space-y-1.5 mb-6">
                    {type.amenities.map((a, i) => (
                      <li key={i} className="flex items-start">
                        <Check size={14} className="text-urbane-gold mr-2 mt-0.5 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <a
                      href="https://urbanehaauz.runhotel.site/en/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-3 rounded bg-urbane-green text-white font-semibold text-sm uppercase tracking-wider hover:bg-urbane-lightGreen transition-colors"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom-of-page supporting copy */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-urbane-gold mb-4">
            <Users size={18} />
            <span className="text-xs uppercase tracking-[0.3em] font-bold">Plan your stay</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Travelling as a family, hosting a small gathering, or booking for a larger group? We can reserve the full
            property on request. Call or WhatsApp{' '}
            <a href="tel:+919136032524" className="text-urbane-green font-semibold">
              +91 9136032524
            </a>{' '}
            — or visit{' '}
            <Link to="/contact" className="text-urbane-green font-semibold underline-offset-4 hover:underline">
              /contact
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
