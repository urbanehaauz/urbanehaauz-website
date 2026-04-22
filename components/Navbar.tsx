import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, CalendarCheck, MapPin, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, signOut, loading, isAdmin } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = `fixed w-full z-50 transition-all duration-500 ${
    scrolled || !isHome 
      ? 'glass-dark shadow-lg py-3 border-b border-white/10' 
      : 'bg-transparent py-6'
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <img
              src="/logo-uh.png"
              alt="Urbane Haauz logo"
              width={40}
              height={40}
              decoding="async"
              className="h-10 w-10 rounded-full bg-white object-contain p-1 ring-1 ring-white/20 group-hover:ring-urbane-gold transition-all"
            />
            <div className="hidden xl:flex flex-col">
                <span className="font-serif text-xl font-bold text-white tracking-wider leading-none whitespace-nowrap">
                URBANE HAAUZ
                </span>
                <span className="text-[0.6rem] text-gray-300 tracking-[0.3em] uppercase whitespace-nowrap">Pelling, Sikkim</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-5 xl:space-x-6">
            <Link to="/" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                {t.home}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/rangotsav" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Event
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/pelling-2.0" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Vision
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/rooms" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                {t.rooms}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/experiences" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Experiences
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/blog" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Guides
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                {t.contact}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                  {t.admin}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
              </Link>
            )}
            {!loading && (
              user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white hover:text-urbane-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-urbane-gold flex items-center justify-center">
                      <User size={16} className="text-urbane-darkGreen" />
                    </div>
                    <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <Link
                        to="/my-bookings"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <CalendarCheck size={16} />
                        <span>{t.myBookings}</span>
                      </Link>
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors"
                >
                  {t.login}
                </button>
              )
            )}
            <LanguageSwitcher variant="navbar" />
            <a
              href="https://urbanehaauz.runhotel.site/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-urbane-gold to-urbane-goldLight text-urbane-darkGreen px-6 py-2.5 rounded-none font-bold hover:shadow-gold hover:scale-105 transition-all duration-300 text-sm tracking-wide"
            >
              {t.bookNow.toUpperCase()}
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 hover:bg-white/10 rounded">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-dark absolute w-full shadow-xl border-t border-white/10">
          <div className="px-4 pt-4 pb-8 space-y-4 flex flex-col items-center">
            <Link
              to="/"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              to="/rangotsav"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Event
            </Link>
            <Link
              to="/pelling-2.0"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Vision
            </Link>
            <Link
              to="/rooms"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              {t.rooms}
            </Link>
            <Link
              to="/experiences"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Experiences
            </Link>
            <Link
              to="/blog"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Guides
            </Link>
            <Link
              to="/contact"
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              {t.contact}
            </Link>
            {user && (
              <Link
                to="/my-bookings"
                className="text-white text-lg font-serif hover:text-urbane-gold"
                onClick={() => setIsOpen(false)}
              >
                {t.myBookings}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-white text-lg font-serif hover:text-urbane-gold"
                onClick={() => setIsOpen(false)}
              >
                {t.admin}
              </Link>
            )}
            {!loading && !user && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="text-white text-lg font-serif hover:text-urbane-gold"
              >
                {t.login}
              </button>
            )}
            {user && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="text-gray-300 text-sm hover:text-urbane-gold flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            )}
            <div className="pt-2">
              <LanguageSwitcher variant="navbar" />
            </div>
            <a
              href="https://urbanehaauz.runhotel.site/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs bg-urbane-gold text-urbane-green font-bold py-3 rounded-none text-center mt-4"
              onClick={() => setIsOpen(false)}
            >
              {t.bookYourStay.toUpperCase()}
            </a>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </nav>
  );
};

export default Navbar;