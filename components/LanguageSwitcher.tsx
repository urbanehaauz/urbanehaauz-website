import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer' | 'floating';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'navbar' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={toggleLanguage}
        className="fixed bottom-24 left-6 z-40 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-300 group border border-gray-200"
        title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
      >
        <Globe className="h-5 w-5 text-urbane-darkGreen group-hover:text-urbane-gold transition-colors" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {language === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{language === 'en' ? 'हिंदी' : 'English'}</span>
      </button>
    );
  }

  // Default navbar variant
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1.5 text-white hover:text-urbane-gold transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
      title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wider">
        {language === 'en' ? 'हि' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
