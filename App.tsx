import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import BookingFlow from './pages/BookingFlow';
import LocalExperiences from './pages/LocalExperiences';
import Contact from './pages/Contact';
import MyBookings from './pages/MyBookings';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

// Admin bundle is code-split and lazy-loaded so public visitors never download it.
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));

// Standalone campaign/presentation pages — heavy SVGs + recharts, lazy-load so they don't bloat initial bundle.
const Rangbhoomi = React.lazy(() => import('./pages/Rangbhoomi'));
const PellingAfterDark = React.lazy(() => import('./pages/PellingAfterDark'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const STANDALONE_ROUTES = ['/rangotsav', '/pelling-2.0'];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStandaloneRoute = isAdminRoute || STANDALONE_ROUTES.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-urbane-mist">
      {!isStandaloneRoute && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isStandaloneRoute && <Footer />}
      {!isStandaloneRoute && <WhatsAppButton />}
      {!isStandaloneRoute && <LanguageSwitcher variant="floating" />}
    </div>
  );
};

const AdminFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-urbane-charcoal">
    Loading…
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppProvider>
            <BrowserRouter>
              <ScrollToTop />
              <MainLayout>
                <Suspense fallback={<AdminFallback />}>
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
                    <Route path="/rangotsav" element={<Rangbhoomi />} />
                    <Route path="/rangbhoomi" element={<Navigate to="/rangotsav" replace />} />
                    <Route path="/pelling-2.0" element={<PellingAfterDark />} />
                    <Route path="/pelling-after-dark" element={<Navigate to="/pelling-2.0" replace />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </BrowserRouter>
          </AppProvider>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
