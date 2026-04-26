/**
 * Urbane Haauz — Marketing Automation Configuration
 *
 * Central config for all marketing agents: brand voice, content themes,
 * Bengali festival calendar, seasonal moods, and rotation schedules.
 *
 * This file is read by Claude Code agents (content-generator, social-media-agent, etc.)
 * to determine what kind of content to produce on any given day.
 */

// ============================================================
// BRAND GUIDELINES — non-negotiable rules for all content
// ============================================================
export const BRAND_GUIDELINES = {
  // ALWAYS include in every piece of content
  always: [
    'Mention Kanchenjunga views (direct views from rooms)',
    'Mention Upper Pelling specifically (not just "Pelling")',
    'Include a direct booking nudge (urbanehaauz.com or RunHotel link)',
    'Use "boutique hotel" — never "resort", "lodge", or "guesthouse"',
  ],
  // NEVER say in any content
  never: [
    'Never claim a star rating (no "4-star", "5-star", "luxury hotel")',
    'Never name or criticize competitor hotels',
    'Never invent guest reviews, awards, or certifications',
    'Never use "cheap" or "budget" — say "value" or "accessible"',
    'Never mention specific room prices (prices change seasonally, direct to booking engine)',
  ],
  // Property facts (ground truth)
  facts: {
    name: 'Urbane Haauz',
    tagline: 'Boutique Hotel in Upper Pelling with Direct Kanchenjunga Views',
    location: 'Skywalk Road, Upper Pelling, West Sikkim 737113, India',
    rooms: 3, // Dormitory Room, Super Deluxe Room, Premium Room
    roomTypes: ['Dormitory Room', 'Super Deluxe Room', 'Premium Room'],
    amenities: [
      'Free WiFi', 'Restaurant', 'Bar', 'Free Parking', 'Mountain View',
      '24h Hot Water', 'Power Backup', 'Room Service', 'Pet-friendly (on request)',
    ],
    mealPlans: ['CP (Continental Plan)', 'MAP (Modified American Plan)'],
    usp: [
      'Direct Kanchenjunga (8,586m) views from rooms',
      'Only boutique hotel in Pelling with both rooms AND dorm beds',
      'CP/MAP meal plans — rare among Pelling competitors',
      'Upper Pelling elevation — 20-30% premium views vs lower Pelling',
    ],
    website: 'https://urbanehaauz.com',
    bookingUrl: 'https://urbanehaauz.runhotel.site/en/',
    phone: '+91 91360 32524',
    email: 'info@urbanehaauz.com',
    instagram: '@urbanehaauz',
    gstin: '11AXUPB9728M1ZY',
  },
  // Target audience
  audience: {
    primary: 'Bengali/Bihari families from Kolkata (35-55 age, HHI 10L+)',
    secondary: 'Budget backpackers and solo travelers (dorm beds)',
    tertiary: 'OTA travelers discovering Pelling for the first time',
  },
  // Hashtag banks
  hashtags: {
    core: ['#UrbaneHaauz', '#UpperPelling', '#KanchenjungaView', '#PellingSikkim', '#BoutiqueHotel'],
    location: ['#Sikkim', '#WestSikkim', '#Pelling', '#NorthEastIndia', '#Himalayas', '#MountainView'],
    travel: ['#TravelIndia', '#HillStation', '#MountainEscape', '#WeekendGetaway', '#NatureRetreat'],
    bengali: ['#KolkataToSikkim', '#BengaliTravel', '#DurgaPujaTrip', '#SikkimTour', '#BongWanderlust'],
    seasonal: {
      spring: ['#SpringInSikkim', '#Rhododendron', '#CherryBlossom'],
      monsoon: ['#MonsoonMagic', '#CloudsAndMountains', '#RainyRetreat'],
      autumn: ['#AutumnVibes', '#ClearSkies', '#DurgaPuja'],
      winter: ['#WinterInSikkim', '#SnowCappedPeaks', '#NewYearGetaway'],
    },
  },
} as const;

// ============================================================
// CONTENT VOICE — 3 rotating tones
// ============================================================
export type Voice = 'warm_aspirational' | 'founder_led' | 'practical_informative';

export const VOICE_DEFINITIONS: Record<Voice, { description: string; example: string }> = {
  warm_aspirational: {
    description: 'Luxury-lite, emotional, travel-dreamy. Short sentences. Evocative imagery. Let the mountain do the talking.',
    example: 'Wake up to Kanchenjunga. No alarm needed — the sunrise will find you. Your mountain home in Upper Pelling awaits.',
  },
  founder_led: {
    description: 'Personal, authentic, first-person from a founder. Behind-the-scenes, honest, conversational.',
    example: 'We built Urbane Haauz because we fell in love with this view and couldn\'t leave. Here\'s what sunrise looked like this morning from our Premium Room balcony.',
  },
  practical_informative: {
    description: 'Utility-first, SEO-friendly, answering real questions. Lists, timings, costs, how-to. Bengali-family-friendly.',
    example: '3-day Pelling itinerary from Kolkata: Darjeeling Mail to NJP (10PM-8AM), shared sumo to Pelling (6hrs), check in by 3PM. Day 1: Skywalk at sunset...',
  },
};

// Voice rotation: cycles every 3 days
export const getVoiceForDate = (date: Date): Voice => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const voices: Voice[] = ['warm_aspirational', 'founder_led', 'practical_informative'];
  return voices[dayOfYear % 3];
};

// ============================================================
// CONTENT THEMES — 4 rotating themes
// ============================================================
export type Theme = 'seasonal' | 'bengali_festival' | 'weekend_getaway' | 'ugc' | 'founder_story' | 'practical_guide';

export const THEME_DEFINITIONS: Record<Theme, { description: string; contentIdeas: string[] }> = {
  seasonal: {
    description: 'Content tied to Pelling\'s current season — weather, views, what to pack, what to expect.',
    contentIdeas: [
      'Kanchenjunga visibility report (current conditions)',
      'Seasonal flower/nature update (rhododendrons, orchids)',
      'Weather forecast + packing advice',
      'Sunrise/sunset timing for the month',
      'Seasonal food at the restaurant',
    ],
  },
  bengali_festival: {
    description: 'Targeted at Bengali families from Kolkata — Durga Puja, Poila Boishakh, etc.',
    contentIdeas: [
      'Puja vacation package teaser',
      'Bengali comfort food at the restaurant',
      'Family room configurations for Puja groups',
      'Kolkata → Pelling travel guide in festival context',
      'Past guest Bengali family stories',
    ],
  },
  weekend_getaway: {
    description: 'Thu/Fri posts targeting impulse weekend trips from Kolkata, Siliguri, Bagdogra.',
    contentIdeas: [
      '"This weekend" urgency post with room availability',
      'Friday escape itinerary (2-night)',
      'Drive-from-Siliguri weekend plan',
      'Couple\'s weekend mountain retreat',
      'Friends group dorm + mountain hike weekend',
    ],
  },
  ugc: {
    description: 'Guest photos, testimonials, check-in stories. Build social proof.',
    contentIdeas: [
      'Guest photo repost (with permission)',
      'Guest review highlight card',
      '"Guests from [city]" series',
      'Before/after: arrival vs morning Kanchenjunga view',
      'Guest itinerary walkthrough',
    ],
  },
  founder_story: {
    description: 'Behind-the-scenes from Ayan, Shovit, Souvik. Building the hotel, daily life in Pelling.',
    contentIdeas: [
      'Why we chose Upper Pelling',
      'The view that made us stay',
      'A day in the life at Urbane Haauz',
      'What we learned from our first 100 guests',
      'Staff spotlight',
    ],
  },
  practical_guide: {
    description: 'Informational content that answers real search queries. SEO-driven.',
    contentIdeas: [
      'How to reach Pelling from Kolkata',
      'Upper Pelling vs Lower Pelling',
      'Best time to visit for Kanchenjunga views',
      'What to do in Pelling in 3 days',
      'Pelling monastery circuit guide',
    ],
  },
};

// Theme rotation: cycles every 4 days (skip ugc/founder_story if no assets)
export const getThemeForDate = (date: Date): Theme => {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const themes: Theme[] = ['seasonal', 'bengali_festival', 'weekend_getaway', 'practical_guide'];
  return themes[dayOfYear % 4];
};

// ============================================================
// BENGALI FESTIVAL CALENDAR — 2026-2027
// ============================================================
export const BENGALI_FESTIVALS: Array<{
  name: string;
  namebn: string;
  date: string; // ISO date
  contentWindow: { start: string; end: string }; // when to start/stop posting about it
  travelRelevance: string;
}> = [
  {
    name: 'Poila Boishakh (Bengali New Year)',
    namebn: 'পয়লা বৈশাখ',
    date: '2026-04-15',
    contentWindow: { start: '2026-04-01', end: '2026-04-16' },
    travelRelevance: 'Families take short trips; Pelling is ideal 3-day escape from Kolkata',
  },
  {
    name: 'Rabindra Jayanti',
    namebn: 'রবীন্দ্র জয়ন্তী',
    date: '2026-05-09',
    contentWindow: { start: '2026-05-01', end: '2026-05-10' },
    travelRelevance: 'Cultural holiday — mountain retreat for book-reading, poetry-loving Bengali travelers',
  },
  {
    name: 'Durga Puja',
    namebn: 'দুর্গাপূজা',
    date: '2026-10-11', // Shashti — actual dates vary
    contentWindow: { start: '2026-09-15', end: '2026-10-15' },
    travelRelevance: 'THE biggest travel trigger for Bengali families. Book 3 months ahead. Premium pricing.',
  },
  {
    name: 'Kali Puja / Diwali',
    namebn: 'কালী পূজা',
    date: '2026-10-29',
    contentWindow: { start: '2026-10-20', end: '2026-10-30' },
    travelRelevance: 'Extended holiday — some families combine with Puja trip for 2-week vacation',
  },
  {
    name: 'Christmas & New Year',
    namebn: 'বড়দিন ও নববর্ষ',
    date: '2026-12-25',
    contentWindow: { start: '2026-12-10', end: '2027-01-05' },
    travelRelevance: 'Winter tourism surge in Sikkim — record hotel bookings in Dec 2025',
  },
  {
    name: 'Saraswati Puja',
    namebn: 'সরস্বতী পূজা',
    date: '2027-02-01', // approximate — depends on Panchami
    contentWindow: { start: '2027-01-20', end: '2027-02-02' },
    travelRelevance: 'Short holiday — weekend getaway opportunity',
  },
  {
    name: 'Holi / Dol Yatra',
    namebn: 'দোলযাত্রা',
    date: '2027-03-14',
    contentWindow: { start: '2027-03-01', end: '2027-03-15' },
    travelRelevance: 'Spring break + Holi holiday — Pelling rhododendrons in bloom',
  },
];

// ============================================================
// PELLING SEASONAL MOODS — for image prompts & captions
// ============================================================
export const SEASONAL_MOODS: Record<string, {
  months: number[];
  mood: string;
  visualCues: string[];
  captionHooks: string[];
}> = {
  spring: {
    months: [2, 3, 4], // Mar, Apr, May
    mood: 'Vibrant, clear, alive. Rhododendrons blooming, Kanchenjunga crystal-clear at dawn.',
    visualCues: ['rhododendron blooms (red, pink, white)', 'crystal-clear mountain views', 'green terraces', 'golden sunrise on snow peaks', 'prayer flags against blue sky'],
    captionHooks: ['The mountain is showing off today', 'Rhododendron season has arrived', 'This is why you come in spring'],
  },
  monsoon: {
    months: [5, 6, 7], // Jun, Jul, Aug
    mood: 'Moody, atmospheric, intimate. Clouds wrap around the hotel. Rain on the window.',
    visualCues: ['clouds flowing through valleys', 'rain on window panes', 'misty mountain silhouettes', 'lush green after rain', 'cozy indoor restaurant scenes'],
    captionHooks: ['The clouds came to visit', 'Monsoon mornings hit different', 'When the mountain hides, the hotel glows'],
  },
  autumn: {
    months: [8, 9, 10], // Sep, Oct, Nov
    mood: 'Clear, golden, festive. Post-monsoon clarity. Durga Puja energy. Best photography light.',
    visualCues: ['golden-hour mountain light', 'clear sky after monsoon', 'festival decorations', 'warm tones in landscape', 'families celebrating'],
    captionHooks: ['Post-monsoon clarity is unmatched', 'Puja plans? The mountain is ready', 'October light in Upper Pelling'],
  },
  winter: {
    months: [11, 0, 1], // Dec, Jan, Feb
    mood: 'Crisp, cozy, snow-capped. Kanchenjunga wears its whitest crown. Fireplace evenings.',
    visualCues: ['snow-capped Kanchenjunga at sunrise', 'frost on railings', 'warm lighting inside rooms', 'hot chai with mountain view', 'clear winter stars'],
    captionHooks: ['Winter stripped the haze. Now there is only mountain.', 'The coldest mornings have the clearest views', 'New Year at 2,150 metres'],
  },
};

// ============================================================
// CONTENT CALENDAR HELPERS
// ============================================================

/**
 * Get the current season based on month index (0-11)
 */
export const getSeasonForMonth = (monthIdx: number): string => {
  for (const [season, config] of Object.entries(SEASONAL_MOODS)) {
    if (config.months.includes(monthIdx)) return season;
  }
  return 'spring';
};

/**
 * Get upcoming Bengali festival within the next N days
 */
export const getUpcomingFestival = (from: Date, withinDays = 30) => {
  const cutoff = new Date(from.getTime() + withinDays * 86400000);
  return BENGALI_FESTIVALS.find(f => {
    const fDate = new Date(f.date);
    return fDate >= from && fDate <= cutoff;
  });
};

/**
 * Check if today falls within a festival's content window
 */
export const isInFestivalWindow = (date: Date) => {
  return BENGALI_FESTIVALS.find(f => {
    const start = new Date(f.contentWindow.start);
    const end = new Date(f.contentWindow.end);
    return date >= start && date <= end;
  });
};
