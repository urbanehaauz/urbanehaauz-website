// Internationalization translations for Urbane Haauz
// Supports English (en) and Hindi (hi)

export type Language = 'en' | 'hi';

export interface Translations {
  // Common
  home: string;
  rooms: string;
  bookNow: string;
  contact: string;
  myBookings: string;
  login: string;
  logout: string;
  experiences: string;
  admin: string;

  // Homepage Hero
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroExplore: string;

  // Booking
  checkIn: string;
  checkOut: string;
  guests: string;
  adults: string;
  children: string;
  selectRoom: string;
  bookYourStay: string;
  totalAmount: string;
  proceedToPayment: string;

  // Room Types
  deluxeRoom: string;
  familySuite: string;
  superDeluxe: string;
  perNight: string;
  viewDetails: string;

  // Contact
  getInTouch: string;
  sendMessage: string;
  yourName: string;
  yourEmail: string;
  phone: string;
  message: string;
  subject: string;

  // Reviews
  guestReviews: string;
  writeReview: string;
  shareExperience: string;
  submitReview: string;

  // My Bookings
  upcomingBookings: string;
  pastBookings: string;
  cancelledBookings: string;
  cancelBooking: string;
  noBookings: string;

  // Footer
  quickLinks: string;
  contactUs: string;
  followUs: string;
  allRightsReserved: string;

  // Misc
  loading: string;
  error: string;
  success: string;
  tryAgain: string;
  viewAll: string;
  learnMore: string;
  whatsappUs: string;
  callUs: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    home: 'Home',
    rooms: 'Rooms',
    bookNow: 'Book Now',
    contact: 'Contact',
    myBookings: 'My Bookings',
    login: 'Login',
    logout: 'Sign Out',
    experiences: 'Experiences',
    admin: 'Admin',

    // Homepage Hero
    heroTagline: 'Welcome to Pelling, Sikkim',
    heroTitle: 'Where Mountains Meet Modern Comfort',
    heroSubtitle: 'Experience breathtaking views of the mighty Kanchenjunga from our boutique retreat nestled in the heart of Pelling.',
    heroExplore: 'Explore Our Rooms',

    // Booking
    checkIn: 'Check In',
    checkOut: 'Check Out',
    guests: 'Guests',
    adults: 'Adults',
    children: 'Children',
    selectRoom: 'Select Room',
    bookYourStay: 'Book Your Stay',
    totalAmount: 'Total Amount',
    proceedToPayment: 'Proceed to Payment',

    // Room Types
    deluxeRoom: 'Deluxe Room',
    familySuite: 'Family Suite',
    superDeluxe: 'Super Deluxe',
    perNight: 'per night',
    viewDetails: 'View Details',

    // Contact
    getInTouch: 'Get In Touch',
    sendMessage: 'Send Message',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    phone: 'Phone Number',
    message: 'Message',
    subject: 'Subject',

    // Reviews
    guestReviews: 'Guest Reviews',
    writeReview: 'Write a Review',
    shareExperience: 'Share Your Experience',
    submitReview: 'Submit Review',

    // My Bookings
    upcomingBookings: 'Upcoming',
    pastBookings: 'Past',
    cancelledBookings: 'Cancelled',
    cancelBooking: 'Cancel Booking',
    noBookings: 'No bookings found',

    // Footer
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',

    // Misc
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    tryAgain: 'Try Again',
    viewAll: 'View All',
    learnMore: 'Learn More',
    whatsappUs: 'WhatsApp Us',
    callUs: 'Call Us',
  },

  hi: {
    // Common
    home: 'होम',
    rooms: 'कमरे',
    bookNow: 'अभी बुक करें',
    contact: 'संपर्क करें',
    myBookings: 'मेरी बुकिंग',
    login: 'लॉगिन',
    logout: 'साइन आउट',
    experiences: 'अनुभव',
    admin: 'एडमिन',

    // Homepage Hero
    heroTagline: 'पेल्लिंग, सिक्किम में आपका स्वागत है',
    heroTitle: 'जहाँ पहाड़ आधुनिक आराम से मिलते हैं',
    heroSubtitle: 'पेल्लिंग के हृदय में बसे हमारे बुटीक रिट्रीट से शक्तिशाली कंचनजंगा के लुभावने दृश्यों का अनुभव करें।',
    heroExplore: 'हमारे कमरे देखें',

    // Booking
    checkIn: 'चेक इन',
    checkOut: 'चेक आउट',
    guests: 'मेहमान',
    adults: 'वयस्क',
    children: 'बच्चे',
    selectRoom: 'कमरा चुनें',
    bookYourStay: 'अपना ठहराव बुक करें',
    totalAmount: 'कुल राशि',
    proceedToPayment: 'भुगतान के लिए आगे बढ़ें',

    // Room Types
    deluxeRoom: 'डीलक्स कमरा',
    familySuite: 'फैमिली सुइट',
    superDeluxe: 'सुपर डीलक्स',
    perNight: 'प्रति रात',
    viewDetails: 'विवरण देखें',

    // Contact
    getInTouch: 'संपर्क में रहें',
    sendMessage: 'संदेश भेजें',
    yourName: 'आपका नाम',
    yourEmail: 'आपका ईमेल',
    phone: 'फ़ोन नंबर',
    message: 'संदेश',
    subject: 'विषय',

    // Reviews
    guestReviews: 'मेहमानों की समीक्षाएं',
    writeReview: 'समीक्षा लिखें',
    shareExperience: 'अपना अनुभव साझा करें',
    submitReview: 'समीक्षा सबमिट करें',

    // My Bookings
    upcomingBookings: 'आने वाली',
    pastBookings: 'पिछली',
    cancelledBookings: 'रद्द की गई',
    cancelBooking: 'बुकिंग रद्द करें',
    noBookings: 'कोई बुकिंग नहीं मिली',

    // Footer
    quickLinks: 'त्वरित लिंक',
    contactUs: 'संपर्क करें',
    followUs: 'हमें फॉलो करें',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',

    // Misc
    loading: 'लोड हो रहा है...',
    error: 'एक त्रुटि हुई',
    success: 'सफलता!',
    tryAgain: 'पुनः प्रयास करें',
    viewAll: 'सभी देखें',
    learnMore: 'और जानें',
    whatsappUs: 'व्हाट्सएप करें',
    callUs: 'कॉल करें',
  }
};
