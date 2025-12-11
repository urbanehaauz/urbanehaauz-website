
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Booking, Staff, Investment, Expense } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  staff: Staff[];
  investments: Investment[];
  expenses: Expense[];
  loading: boolean;
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
  homeHeroImage: string;
  adminBackgroundImage: string;
  updateHomeHeroImage: (url: string) => void;
  updateAdminBackgroundImage: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_IMAGE = '/lib/hero-image.png';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAdmin, user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [homeHeroImage, setHomeHeroImage] = useState<string>(() => {
    return localStorage.getItem('homeHeroImage') || DEFAULT_IMAGE;
  });
  const [adminBackgroundImage, setAdminBackgroundImage] = useState<string>(() => {
    return localStorage.getItem('adminBackgroundImage') || DEFAULT_IMAGE;
  });

  // Load rooms (public - everyone can see)
  useEffect(() => {
    const loadRooms = async () => {
      try {
        console.log('🔄 Attempting to load rooms from Supabase...');
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('price', { ascending: true });

        if (error) {
          console.error('❌ Error loading rooms:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          // Check if it's an RLS policy issue
          if (error.message.includes('permission denied') || error.code === '42501') {
            console.error('🚨 RLS Policy Issue: Rooms table needs public read policy!');
            console.error('Run this SQL in Supabase:');
            console.error('CREATE POLICY "Anyone can view available rooms" ON rooms FOR SELECT USING (true);');
          }
          
          setRooms([]);
        } else if (data && data.length > 0) {
          console.log(`📦 Raw data from Supabase:`, data);
          const mappedRooms = data.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category as Room['category'],
            price: Number(r.price),
            maxOccupancy: r.max_occupancy,
            image: r.image || '',
            description: r.description || '',
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            available: r.available ?? true,
          }));
          console.log(`✅ Loaded ${mappedRooms.length} rooms from database:`, mappedRooms);
          setRooms(mappedRooms);
        } else {
          console.warn('⚠️ No rooms found in database (data is empty or null)');
          console.log('Data received:', data);
          setRooms([]);
        }
      } catch (err) {
        console.error('💥 Unexpected error loading rooms:', err);
        setRooms([]);
      } finally {
        setLoading(false);
        console.log('✅ Room loading completed, loading set to false');
      }
    };
    loadRooms();
  }, []);

  // Load bookings
  useEffect(() => {
    const loadBookings = async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('date_created', { ascending: false });

      // If not admin, only load user's bookings
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading bookings:', error);
      } else if (data) {
        setBookings(data.map(b => ({
          id: b.id,
          guestName: b.guest_name,
          email: b.email,
          phone: b.phone,
          roomName: b.room_name,
          roomId: b.room_id,
          checkIn: b.check_in,
          checkOut: b.check_out,
          totalAmount: Number(b.total_amount),
          status: b.status as Booking['status'],
          paymentStatus: b.payment_status as Booking['paymentStatus'],
          source: b.source as Booking['source'],
          dateCreated: b.date_created?.split('T')[0] || new Date().toISOString().split('T')[0],
        })));
      }
      setLoading(false);
    };

    loadBookings();
    
    // Subscribe to real-time updates for bookings
    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, user]);

  // Load staff and tasks (admin only)
  useEffect(() => {
    if (!isAdmin) {
      setStaff([]);
      return;
    }

    const loadStaff = async () => {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (staffError) {
        console.error('Error loading staff:', staffError);
        return;
      }

      if (staffData) {
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        const staffWithTasks = staffData.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          shift: s.shift as Staff['shift'],
          tasks: (tasksData || [])
            .filter(t => t.staff_id === s.id)
            .map(t => ({
              id: t.id,
              description: t.description || t.title || '',
              completed: t.status === 'Completed',
            })),
        }));
        
        setStaff(staffWithTasks);
      }
    };

    loadStaff();
  }, [isAdmin]);

  // Load investments (admin only)
  useEffect(() => {
    if (!isAdmin) {
      setInvestments([]);
      return;
    }

    const loadInvestments = async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading investments:', error);
      } else if (data) {
        setInvestments(data.map(inv => ({
          id: inv.id,
          investorName: inv.investor_name,
          amount: Number(inv.amount),
          date: inv.date,
          type: inv.type as Investment['type'],
        })));
      }
    };

    loadInvestments();
  }, [isAdmin]);

  // Load expenses (admin only)
  useEffect(() => {
    if (!isAdmin) {
      setExpenses([]);
      return;
    }

    const loadExpenses = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error);
      } else if (data) {
        setExpenses(data.map(exp => ({
          id: exp.id,
          description: exp.description,
          category: exp.category as Expense['category'],
          amount: Number(exp.amount),
          date: exp.date,
        })));
      }
    };

    loadExpenses();
  }, [isAdmin]);

  // Load settings (for ALL users - hero image should be visible to everyone)
  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (!error && data) {
        const heroSetting = data.find(s => s.key === 'home_hero_image');
        const adminSetting = data.find(s => s.key === 'admin_background_image');
        
        // Load hero image for all users (public setting)
        if (heroSetting && heroSetting.value) {
          setHomeHeroImage(heroSetting.value);
        }
        
        // Load admin background only for admins
        if (isAdmin && adminSetting && adminSetting.value) {
          setAdminBackgroundImage(adminSetting.value);
        }
      }
    };

    loadSettings();
  }, [isAdmin]);

  const updateRoom = async (updatedRoom: Room) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: updatedRoom.name,
          category: updatedRoom.category,
          price: updatedRoom.price,
          max_occupancy: updatedRoom.maxOccupancy,
          image: updatedRoom.image,
          description: updatedRoom.description,
          amenities: updatedRoom.amenities,
          available: updatedRoom.available,
        })
        .eq('id', updatedRoom.id);

      if (error) throw error;
      
      setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const addRoom = async (room: Room) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: room.name,
          category: room.category,
          price: room.price,
          max_occupancy: room.maxOccupancy,
          image: room.image,
          description: room.description,
          amenities: room.amenities,
          available: room.available,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const newRoom: Room = {
          ...room,
          id: data.id,
        };
        setRooms(prev => [...prev, newRoom]);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const addBooking = async (booking: Booking) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          id: booking.id,
          user_id: user?.id || null,
          guest_name: booking.guestName,
          email: booking.email,
          phone: booking.phone,
          room_id: booking.roomId || null,
          room_name: booking.roomName,
          check_in: booking.checkIn,
          check_out: booking.checkOut,
          total_amount: booking.totalAmount,
          status: booking.status,
          payment_status: booking.paymentStatus,
          source: booking.source,
        });

      if (error) throw error;
      
      // Optimistically update UI
      setBookings(prev => [booking, ...prev]);
    } catch (error) {
      console.error('Error adding booking:', error);
      // Revert optimistic update on error
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      
      // Auto-refund on cancellation
      if (updates.status === 'Cancelled' && !updates.paymentStatus) {
        dbUpdates.payment_status = 'Refunded';
      }

      const { error } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const addStaff = async (newStaff: Staff) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: newStaff.name,
          role: newStaff.role,
          shift: newStaff.shift,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const staffMember: Staff = {
          ...newStaff,
          id: data.id,
          tasks: [],
        };
        setStaff(prev => [...prev, staffMember]);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const addTask = async (staffId: string, taskDesc: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          staff_id: staffId,
          title: taskDesc,
          description: taskDesc,
          status: 'Pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setStaff(prev => prev.map(s => {
          if (s.id === staffId) {
            return {
              ...s,
              tasks: [...s.tasks, { id: data.id, description: taskDesc, completed: false }]
            };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (staffId: string, taskId: string) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      const task = staffMember?.tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.completed ? 'In Progress' : 'Completed';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      
      setStaff(prev => prev.map(s => {
        if (s.id === staffId) {
          return {
            ...s,
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
          };
        }
        return s;
      }));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addInvestment = async (inv: Investment) => {
    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          id: inv.id,
          investor_name: inv.investorName,
          amount: inv.amount,
          date: inv.date,
          type: inv.type,
        });

      if (error) throw error;
      
      setInvestments(prev => [...prev, inv]);
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const addExpense = async (exp: Expense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          id: exp.id,
          description: exp.description,
          category: exp.category,
          amount: exp.amount,
          date: exp.date,
        });

      if (error) throw error;
      
      setExpenses(prev => [...prev, exp]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  // Admin auth is now handled by AuthContext, but we keep these for compatibility
  const isAdminLoggedIn = isAdmin;

  const loginAdmin = () => {
    // This is now handled by AuthContext - keep for backward compatibility
    console.warn('loginAdmin is deprecated - use AuthContext instead');
  };

  const logoutAdmin = () => {
    // This is now handled by AuthContext - keep for backward compatibility
    console.warn('logoutAdmin is deprecated - use AuthContext instead');
  };

  // Settings Updaters
  const updateHomeHeroImage = async (url: string) => {
    // Update local state immediately for UI responsiveness
    setHomeHeroImage(url);
    
    // Only save to database if admin (security check)
    if (isAdmin) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'home_hero_image', value: url }, { onConflict: 'key' });
        
        if (error) {
          console.error('Error saving hero image:', error);
          // Revert on error
          const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'home_hero_image')
            .single();
          if (data) setHomeHeroImage(data.value || DEFAULT_IMAGE);
        }
      } catch (error) {
        console.error('Error saving hero image:', error);
      }
    }
  };

  const updateAdminBackgroundImage = async (url: string) => {
    // Update local state immediately for UI responsiveness
    setAdminBackgroundImage(url);
    
    // Only save to database if admin (security check)
    if (isAdmin) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'admin_background_image', value: url }, { onConflict: 'key' });
        
        if (error) {
          console.error('Error saving admin background:', error);
          // Revert on error
          const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'admin_background_image')
            .single();
          if (data) setAdminBackgroundImage(data.value || DEFAULT_IMAGE);
        }
      } catch (error) {
        console.error('Error saving admin background:', error);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      rooms,
      bookings,
      staff,
      investments,
      expenses,
      loading,
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
