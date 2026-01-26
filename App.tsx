import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import BookingFlow from './pages/BookingFlow';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AuthCallback from './pages/AuthCallback';
import LocalExperiences from './pages/LocalExperiences';
import Contact from './pages/Contact';
import MyBookings from './pages/MyBookings';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide footer and WhatsApp button on admin pages
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-urbane-mist">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <LanguageSwitcher variant="floating" />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppProvider>
          <HashRouter>
            <ScrollToTop />
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/experiences" element={<LocalExperiences />} />
                <Route path="/book" element={<BookingFlow />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </MainLayout>
          </HashRouter>
        </AppProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;