import React from 'react';
import { Mountain, MapPin, Phone, Mail, Instagram, Facebook, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Hotel contact information - centralized for easy updates
export const HOTEL_CONTACT = {
  phone: '+91 9136032524',
  phoneClean: '+919136032524',
  email: 'info@urbanehaauz.com',
  whatsapp: '+919136032524',
  address: 'SH-510, Skywalk Road, Upper Pelling',
  city: 'West Sikkim, India 737113',
  instagram: 'https://instagram.com/urbanehaauz',
  facebook: 'https://facebook.com/urbanehaauz',
  gstin: '11AXUPB9728M1ZY',
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-urbane-darkGreen text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mountain className="h-6 w-6 text-urbane-gold" />
              <span className="font-serif text-xl font-bold">URBANE HAAUZ</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Where Mountains Meet Modern Comfort. Experience the serenity of Pelling with unmatched hospitality.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-white">Accommodation</Link></li>
              <li><a href="https://urbanehaauz.runhotel.site/en/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Book Now</a></li>
              <li><Link to="/experiences" className="hover:text-white">Local Experiences</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>{HOTEL_CONTACT.address}<br />{HOTEL_CONTACT.city}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <a href={`tel:${HOTEL_CONTACT.phoneClean}`} className="hover:text-urbane-gold transition-colors">{HOTEL_CONTACT.phone}</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <a href={`mailto:${HOTEL_CONTACT.email}`} className="hover:text-urbane-gold transition-colors">{HOTEL_CONTACT.email}</a>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle size={18} />
                <a
                  href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I'm interested in booking a stay at Urbane Haauz.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-urbane-gold transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href={HOTEL_CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="bg-white/10 p-2 rounded-full hover:bg-urbane-gold hover:text-urbane-darkGreen transition-colors">
                <Instagram size={20} />
              </a>
              <a href={HOTEL_CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="bg-white/10 p-2 rounded-full hover:bg-urbane-gold hover:text-urbane-darkGreen transition-colors">
                <Facebook size={20} />
              </a>
              <a
                href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I'm interested in booking a stay at Urbane Haauz.`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="bg-white/10 p-2 rounded-full hover:bg-green-500 hover:text-white transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>

            {/* Google reviews */}
            <div className="mt-6 space-y-2">
              <a
                href="https://search.google.com/local/reviews?placeid=ChIJ64XS8CiH5jkRhVPjjCbPA_0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-urbane-gold transition-colors"
              >
                <Star size={14} fill="currentColor" className="text-urbane-gold" /> Read reviews on Google
              </a>
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJ64XS8CiH5jkRhVPjjCbPA_0"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-urbane-gold transition-colors"
              >
                Write us a review →
              </a>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">GSTIN: {HOTEL_CONTACT.gstin}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mb-8">
          <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Pelling & Sikkim Guides</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-gray-300 text-sm">
            <li><Link to="/blog/kanchenjunga-view-hotels-pelling" className="hover:text-urbane-gold transition-colors">Kanchenjunga View Hotels</Link></li>
            <li><Link to="/blog/pelling-boutique-hotels-kanchenjunga-comparison" className="hover:text-urbane-gold transition-colors">Pelling Boutique Hotels Compared</Link></li>
            <li><Link to="/blog/intimate-boutique-pelling-personalized-service" className="hover:text-urbane-gold transition-colors">What Boutique Means in Pelling</Link></li>
            <li><Link to="/blog/where-to-stay-in-upper-pelling" className="hover:text-urbane-gold transition-colors">Where to Stay in Upper Pelling</Link></li>
            <li><Link to="/blog/best-time-to-visit-pelling" className="hover:text-urbane-gold transition-colors">Best Time to Visit Pelling</Link></li>
            <li><Link to="/blog/things-to-do-in-pelling" className="hover:text-urbane-gold transition-colors">Things to Do in Pelling</Link></li>
            <li><Link to="/blog/how-to-reach-pelling" className="hover:text-urbane-gold transition-colors">How to Reach Pelling</Link></li>
            <li><Link to="/blog/pelling-2-day-itinerary" className="hover:text-urbane-gold transition-colors">Pelling 2-Day Itinerary</Link></li>
          </ul>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Urbane Haauz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;