import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mountain } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

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
    </nav>
  );
};

export default Navbar;