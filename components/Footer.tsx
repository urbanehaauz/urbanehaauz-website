import React from 'react';
import { Mountain, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

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
              <li><Link to="/book" className="hover:text-white">Book Now</Link></li>
              <li><a href="#" className="hover:text-white">Local Experiences</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>SH-510, Pelling, West Sikkim<br />Sikkim, India 737113</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <span>stay@urbanehaauz.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-urbane-gold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-urbane-gold hover:text-urbane-darkGreen transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-urbane-gold hover:text-urbane-darkGreen transition-colors">
                <Facebook size={20} />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400">GSTIN: 11AAAAA0000A1Z5</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Urbane Haauz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;