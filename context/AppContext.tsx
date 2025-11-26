
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Booking, Staff, Investment, Expense } from '../types';
import { ROOMS, RECENT_BOOKINGS, MOCK_STAFF, MOCK_INVESTMENTS, MOCK_EXPENSES } from '../lib/mockData';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  staff: Staff[];
  investments: Investment[];
  expenses: Expense[];
  updateRoom: (updatedRoom: Room) => void;
  addRoom: (room: Room) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  addStaff: (newStaff: Staff) => void;
  addTask: (staffId: string, taskDesc: string) => void;
  toggleTask: (staffId: string, taskId: string) => void;
  addInvestment: (inv: Investment) => void;
  addExpense: (exp: Expense) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  // New Settings State
  homeHeroImage: string;
  adminBackgroundImage: string;
  updateHomeHeroImage: (url: string) => void;
  updateAdminBackgroundImage: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default fallback image
const DEFAULT_IMAGE = '/lib/hero-image.png';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(RECENT_BOOKINGS);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Settings State with lazy initialization from localStorage
  const [homeHeroImage, setHomeHeroImage] = useState<string>(() => {
    return localStorage.getItem('homeHeroImage') || DEFAULT_IMAGE;
  });
  const [adminBackgroundImage, setAdminBackgroundImage] = useState<string>(() => {
    return localStorage.getItem('adminBackgroundImage') || DEFAULT_IMAGE;
  });

  const updateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const addRoom = (room: Room) => {
    setRooms(prev => [...prev, room]);
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const updatedBooking = { ...b, ...updates };
        if (updates.status === 'Cancelled' && !updates.paymentStatus) {
            updatedBooking.paymentStatus = 'Refunded';
        }
        return updatedBooking;
      }
      return b;
    }));
  };

  const addStaff = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
  };

  const addTask = (staffId: string, taskDesc: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          tasks: [...s.tasks, { id: `T${Date.now()}`, description: taskDesc, completed: false }]
        };
      }
      return s;
    }));
  };

  const toggleTask = (staffId: string, taskId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return s;
    }));
  };

  const addInvestment = (inv: Investment) => {
    setInvestments(prev => [...prev, inv]);
  };

  const addExpense = (exp: Expense) => {
    setExpenses(prev => [...prev, exp]);
  };

  const loginAdmin = () => {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdmin', 'true');
  };

  const logoutAdmin = () => {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('isAdmin');
  };

  // Settings Updaters
  const updateHomeHeroImage = (url: string) => {
    setHomeHeroImage(url);
    localStorage.setItem('homeHeroImage', url);
  };

  const updateAdminBackgroundImage = (url: string) => {
    setAdminBackgroundImage(url);
    localStorage.setItem('adminBackgroundImage', url);
  };

  // Check persisted auth on mount
  useEffect(() => {
      if (localStorage.getItem('isAdmin') === 'true') {
          setIsAdminLoggedIn(true);
      }
  }, []);

  return (
    <AppContext.Provider value={{
      rooms,
      bookings,
      staff,
      investments,
      expenses,
      updateRoom,
      addRoom,
      addBooking,
      updateBooking,
      addStaff,
      addTask,
      toggleTask,
      addInvestment,
      addExpense,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      homeHeroImage,
      adminBackgroundImage,
      updateHomeHeroImage,
      updateAdminBackgroundImage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
