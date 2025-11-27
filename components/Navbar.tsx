import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mountain, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, signOut, loading } = useAuth();

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
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-white/10 rounded-full group-hover:bg-urbane-gold transition-colors duration-300">
                <Mountain className="h-6 w-6 text-urbane-gold group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
                <span className="font-serif text-xl md:text-2xl font-bold text-white tracking-wider leading-none">
                URBANE HAAUZ
                </span>
                <span className="text-[0.6rem] text-gray-300 tracking-[0.3em] uppercase">Pelling, Sikkim</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/rooms" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Rooms
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/admin" className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors relative group">
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-urbane-gold transition-all group-hover:w-full"></span>
            </Link>
            {!loading && (
              user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white hover:text-urbane-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-urbane-gold flex items-center justify-center">
                      <User size={16} className="text-urbane-darkGreen" />
                    </div>
                    <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm uppercase tracking-widest font-medium text-white hover:text-urbane-gold transition-colors"
                >
                  Login
                </button>
              )
            )}
            <Link
              to="/book"
              className="bg-gradient-to-r from-urbane-gold to-urbane-goldLight text-urbane-darkGreen px-8 py-2.5 rounded-none font-bold hover:shadow-gold hover:scale-105 transition-all duration-300 text-sm tracking-wide"
            >
              BOOK NOW
            </Link>
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
              Home
            </Link>
            <Link 
              to="/rooms" 
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Accommodation
            </Link>
            <Link 
              to="/admin" 
              className="text-white text-lg font-serif hover:text-urbane-gold"
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
            <Link 
              to="/book" 
              className="w-full max-w-xs bg-urbane-gold text-urbane-green font-bold py-3 rounded-none text-center mt-4"
              onClick={() => setIsOpen(false)}
            >
              BOOK YOUR STAY
            </Link>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </nav>
  );
};

export default Navbar;