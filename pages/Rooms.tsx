import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, Wifi, Square, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoomCategory } from '../types';

/**
 * JSON-LD: HotelRoom array (Standard / Super Deluxe / Premium / Dorm).
 *
 * Static schema — prices, occupancy, and amenities are hardcoded with reasonable
 * defaults derived from docs/Marketing-Claude/schema/rooms.json. The live Supabase
 * `rooms` table is the source of truth for UI but is intentionally NOT used here
 * because schema must be deterministic for crawlers and should not flap with
 * availability changes. When founders confirm exact price ranges, update the
 * `price` / `priceSpecification` values below.
 *
 * Assumptions flagged for founder verification:
 *   - Peak-season prices from audit + CLAUDE.md (₹1,800–3,900 peak, ₹1,200–3,100 off)
 *   - Super Deluxe = "Deluxe" in schema vocab (existing AppContext uses Super Deluxe label)
 *   - Max occupancy: Standard 2, Super Deluxe 3, Premium 3, Dorm 1 per bed
 *   - Bed type: Double (Standard), King (Super Deluxe / Premium), Bunk (Dorm)
 */
const ROOMS_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HotelRoom',
      '@id': 'https://urbanehaauz.com/rooms#standard',
      name: 'Standard Room',
      description:
        'Comfortable standard room at Urbane Haauz, Upper Pelling, with garden or courtyard view and access to Kanchenjunga-facing common areas. Attached bathroom with 24-hour hot water, free WiFi, and daily housekeeping.',
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'Double bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Attached Bathroom', value: true },
        { '@type': 'LocationFeatureSpecification', name: '24-hour Hot Water', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 1200,
          maxPrice: 2400,
          priceCurrency: 'INR',
        },
        availability: 'https://schema.org/InStock',
        url: 'https://urbanehaauz.com/book',
      },
    },
    {
      '@type': 'HotelRoom',
      '@id': 'https://urbanehaauz.com/rooms#super-deluxe',
      name: 'Super Deluxe Room',
      description:
        'Spacious Super Deluxe room at Urbane Haauz with partial Kanchenjunga mountain view, larger windows, and upgraded furnishings. Attached bathroom, free WiFi, and seating area.',
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'King bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Partial Kanchenjunga View', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Seating Area', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 1900,
          maxPrice: 3200,
          priceCurrency: 'INR',
        },
        availability: 'https://schema.org/InStock',
        url: 'https://urbanehaauz.com/book',
      },
    },
    {
      '@type': 'HotelRoom',
      '@id': 'https://urbanehaauz.com/rooms#premium',
      name: 'Premium Room',
      description:
        'Premium room at Urbane Haauz with direct, unobstructed Kanchenjunga view from a private balcony. The best rooms in the property for sunrise over the Kanchenjunga range. Includes king bed, seating area, and upgraded bath.',
      occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'King bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Private Balcony', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Direct Kanchenjunga View', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 3100,
          maxPrice: 3900,
          priceCurrency: 'INR',
        },
        availability: 'https://schema.org/InStock',
        url: 'https://urbanehaauz.com/book',
      },
    },
    {
      '@type': 'Accommodation',
      '@id': 'https://urbanehaauz.com/rooms#dorm',
      name: 'Dormitory Bed',
      description:
        'Shared dormitory accommodation at Urbane Haauz, Upper Pelling — the only boutique hotel in Pelling offering dorm beds. Features lockers, shared bathroom, free WiFi, and access to the same Kanchenjunga-view common areas as private rooms. Ideal for solo travellers, backpackers, and budget-conscious groups.',
      occupancy: { '@type': 'QuantitativeValue', value: 1 },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'Dorm bunk bed' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Lockers', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Shared Bathroom', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: '24-hour Hot Water', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Common Area with Kanchenjunga View', value: true },
      ],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 400,
          maxPrice: 900,
          priceCurrency: 'INR',
        },
        availability: 'https://schema.org/InStock',
        url: 'https://urbanehaauz.com/book',
      },
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

// FAQPage schema specific to /rooms — different question set than global FAQ
const ROOMS_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://urbanehaauz.com/rooms#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many rooms does Urbane Haauz have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Urbane Haauz has 8 private rooms across Standard, Super Deluxe and Premium categories, plus a shared dormitory for backpackers. Every room has access to Kanchenjunga-facing common areas, and Premium rooms have private balconies directly facing the Kanchenjunga range.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which room at Urbane Haauz has the best Kanchenjunga view?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Premium rooms have direct, unobstructed Kanchenjunga views from a private balcony — the best sunrise rooms in the property. Super Deluxe rooms have partial mountain views. Standard rooms open onto the garden/courtyard with view access from the shared balcony and common areas.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are dorm beds available at Urbane Haauz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Urbane Haauz is the only boutique property in Upper Pelling offering dorm beds alongside private hotel rooms. Dorm beds include lockers, a shared hot-water bathroom, free WiFi, and access to the same Kanchenjunga-view common areas as private-room guests. Priced ₹400–900 per night depending on season.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the room price?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All room rates include free WiFi, 24-hour hot water, daily housekeeping, and power backup. Guests can upgrade to CP (breakfast included) or MAP (breakfast + dinner) meal plans at the time of booking. Airport / station pickup is available on request for an additional charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I book a specific room category directly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Book any category — Standard, Super Deluxe, Premium, or Dorm bed — directly at urbanehaauz.com/book with instant Razorpay confirmation and best-rate guarantee (no OTA commission). For multi-room family bookings or groups, WhatsApp +91 9136032524.',
      },
    },
  ],
};

const Rooms: React.FC = () => {
  const { rooms, loading } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredRooms = filterCategory === 'All'
    ? rooms
    : rooms.filter(room => room.category === filterCategory);

  const categories = ['All', ...Object.values(RoomCategory)];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-urbane-mist">
      <Helmet>
        <title>Rooms & Dorms | Urbane Haauz Pelling — Kanchenjunga View Hotel</title>
        <meta name="description" content="Standard, Deluxe and Premium rooms plus dormitory beds at Urbane Haauz in Upper Pelling. 8 rooms, Kanchenjunga views, CP/MAP meal plans." />
        <link rel="canonical" href="https://urbanehaauz.com/rooms" />
        <meta property="og:title" content="Rooms & Dorms | Urbane Haauz Pelling" />
        <meta property="og:description" content="From backpacker dorms to premium Kanchenjunga-view suites." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/rooms" />
        <script type="application/ld+json">{JSON.stringify(ROOMS_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(ROOMS_BREADCRUMB_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(ROOMS_FAQ_JSONLD)}</script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-urbane-green font-bold mb-4">Our Accommodation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From cozy backpacker dorms to luxurious suites with Kanchenjunga views, we have a space for every traveler.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-urbane-green text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urbane-green mx-auto mb-4"></div>
            <p className="text-gray-500">Loading rooms...</p>
            <p className="text-gray-400 text-xs mt-2">Check console (F12) for details</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later or contact us.</p>
            <p className="text-gray-400 text-xs mt-4">Debug: Check browser console (F12) for loading logs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    width={600}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {!room.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 font-bold rounded transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-urbane-green uppercase tracking-wide">
                    {room.category}
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl font-bold text-gray-900">{room.name}</h3>
                  </div>

                  <div className="mb-4" />

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {room.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500">
                        <Check size={12} className="text-urbane-gold mr-1.5" />
                        {amenity}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users size={16} className="mr-1.5" />
                      <span>Up to {room.maxOccupancy} Guests</span>
                    </div>
                    <Link
                      to={`/book?room=${room.id}`}
                      className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                        room.available
                          ? 'bg-urbane-green text-white hover:bg-urbane-lightGreen'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => !room.available && e.preventDefault()}
                    >
                      {room.available ? 'Book Now' : 'Unavailable'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
