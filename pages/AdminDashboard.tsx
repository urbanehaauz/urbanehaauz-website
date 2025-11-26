
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { DollarSign, Calendar, Users, TrendingUp, TrendingDown, Plus, X, LogOut, Briefcase, UserCheck, LayoutDashboard, BedDouble, CreditCard, Image as ImageIcon, Check, Lock, RotateCcw, Search, Filter, Settings, Upload, CheckCircle } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { BookingStatus, RoomCategory, PaymentStatus } from '../types';

// Updated colors to match new theme: Blue, Copper, Gold, Red
const COLORS = ['#4A90E2', '#8C5E45', '#D4AF37', '#E74C3C'];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-urbane-gold group relative overflow-hidden">
    <div className="absolute right-0 top-0 w-24 h-24 bg-urbane-gold/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{title}</p>
        <h3 className="text-3xl font-serif font-bold text-urbane-darkGreen mt-2">{value}</h3>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-urbane-gold group-hover:text-white transition-colors duration-300 shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm relative z-10">
      <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
         <TrendingUp className="h-3 w-3 mr-1" /> {trend}
      </div>
      <span className="text-gray-400 ml-2 text-xs">vs last month</span>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { 
    rooms, bookings, staff, investments, expenses, isAdminLoggedIn, logoutAdmin,
    updateRoom, addRoom, addBooking, updateBooking, addStaff, addTask, toggleTask, addInvestment, addExpense,
    homeHeroImage, adminBackgroundImage, updateHomeHeroImage, updateAdminBackgroundImage
  } = useApp();
  
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'overview' | 'rooms' | 'bookings' | 'staff' | 'finance' | 'settings'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Booking Status Management State
  const [editingRows, setEditingRows] = useState<Record<string, { status?: BookingStatus, paymentStatus?: PaymentStatus }>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  // Derived Financial Data
  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.totalAmount : 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalInvestment = investments.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Derived Chart Data
  const revenueData = [
    { name: 'Mon', revenue: totalRevenue * 0.1, expense: totalExpenses * 0.15 },
    { name: 'Tue', revenue: totalRevenue * 0.12, expense: totalExpenses * 0.1 },
    { name: 'Wed', revenue: totalRevenue * 0.18, expense: totalExpenses * 0.2 },
    { name: 'Thu', revenue: totalRevenue * 0.15, expense: totalExpenses * 0.1 },
    { name: 'Fri', revenue: totalRevenue * 0.25, expense: totalExpenses * 0.25 },
    { name: 'Sat', revenue: totalRevenue * 0.15, expense: totalExpenses * 0.15 },
    { name: 'Sun', revenue: totalRevenue * 0.05, expense: totalExpenses * 0.05 },
  ];

  const pieData = rooms.map(room => ({
    name: room.category,
    value: bookings.filter(b => b.roomName === room.name).length
  }));

  // --- Handlers ---

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookingEdit = (bookingId: string, field: 'status' | 'paymentStatus', value: string) => {
      setEditingRows(prev => ({
          ...prev,
          [bookingId]: {
              ...prev[bookingId],
              [field]: value
          }
      }));
  };

  const saveBookingChanges = (bookingId: string) => {
      const updates = editingRows[bookingId];
      if (updates) {
          updateBooking(bookingId, updates);
          const newRows = { ...editingRows };
          delete newRows[bookingId];
          setEditingRows(newRows);
          showNotification("Booking updated successfully");
      }
  };

  const resetBookingChanges = (bookingId: string) => {
      const newRows = { ...editingRows };
      delete newRows[bookingId];
      setEditingRows(newRows);
  };

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    roomName: rooms[0].name,
    checkIn: '',
    checkOut: '',
    amount: '',
    source: 'Walk-in' as const,
    paymentStatus: 'Pending' as PaymentStatus
  });

  const calculateTotalAmount = (roomName: string, checkIn: string, checkOut: string) => {
    const room = rooms.find(r => r.name === roomName);
    if (!room || !checkIn || !checkOut) return '';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '';
    return (diffDays * room.price).toString();
  };

  // Helpers
  const getNextDay = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
  };

  const handleBookingDateChange = (name: string, value: string) => {
    setNewBooking(prev => {
      let updated = { ...prev };
      if (name === 'checkIn') {
        updated.checkIn = value;
        if (prev.checkOut && prev.checkOut <= value) {
          updated.checkOut = ''; 
        }
      } else {
        updated[name] = value;
      }
      if (updated.checkIn && updated.checkOut) {
        const calculatedAmount = calculateTotalAmount(updated.roomName, updated.checkIn, updated.checkOut);
        if (calculatedAmount) {
          updated.amount = calculatedAmount;
        }
      }
      return updated;
    });
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomName = e.target.value;
    setNewBooking(prev => {
      const updated = { ...prev, roomName };
      if (updated.checkIn && updated.checkOut) {
        const calculatedAmount = calculateTotalAmount(updated.roomName, updated.checkIn, updated.checkOut);
        if (calculatedAmount) {
          updated.amount = calculatedAmount;
        }
      }
      return updated;
    });
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const booking = {
      id: `BK-2025-${Math.floor(Math.random() * 10000)}`,
      guestName: newBooking.guestName,
      roomName: newBooking.roomName,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      totalAmount: Number(newBooking.amount),
      status: 'Pending' as const,
      paymentStatus: newBooking.paymentStatus,
      source: newBooking.source as any,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    addBooking(booking);
    setIsModalOpen(false);
    setNewBooking({ 
      guestName: '', roomName: rooms[0].name, checkIn: '', checkOut: '', amount: '', 
      source: 'Walk-in', paymentStatus: 'Pending'
    });
    showNotification("New booking created successfully");
  };

  // New Room Form State
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    category: 'Standard Room', 
    price: '',
    maxOccupancy: '',
    image: '',
    description: '',
    amenities: ''
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const room = {
        id: `RM-${Date.now()}`,
        name: newRoomData.name,
        category: newRoomData.category as RoomCategory,
        price: Number(newRoomData.price),
        maxOccupancy: Number(newRoomData.maxOccupancy),
        image: newRoomData.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop',
        description: newRoomData.description,
        amenities: newRoomData.amenities.split(',').map(s => s.trim()),
        available: true
    };
    addRoom(room);
    setIsRoomModalOpen(false);
    setNewRoomData({
        name: '',
        category: 'Standard Room', 
        price: '',
        maxOccupancy: '',
        image: '',
        description: '',
        amenities: ''
    });
    showNotification("New room added to inventory");
  };

  // Finance Form State (keeping for backward compatibility)
  const [financeForm, setFinanceForm] = useState({ type: 'investment', name: '', amount: '', category: '', description: '', date: '' });
  const [activeFinanceTab, setActiveFinanceTab] = useState<'investments' | 'expenses'>('expenses');
  
  // Separate forms for expense and investment modals
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'Maintenance', amount: '', date: new Date().toISOString().split('T')[0] });
  const [investmentForm, setInvestmentForm] = useState({ description: '', category: 'Infrastructure', amount: '', date: new Date().toISOString().split('T')[0] });

  const handleFinanceSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (financeForm.type === 'investment') {
          addInvestment({
              id: `INV-${Date.now()}`,
              investorName: financeForm.name,
              amount: Number(financeForm.amount),
              date: financeForm.date,
              type: 'Seed'
          });
      } else {
          addExpense({
              id: `EXP-${Date.now()}`,
              description: financeForm.description,
              category: financeForm.category as any,
              amount: Number(financeForm.amount),
              date: financeForm.date
          });
      }
      setFinanceForm({ type: 'investment', name: '', amount: '', category: '', description: '', date: '' });
      showNotification("Financial record added");
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addExpense({
          id: `EXP-${Date.now()}`,
          description: expenseForm.description,
          category: expenseForm.category as any,
          amount: Number(expenseForm.amount),
          date: expenseForm.date
      });
      setExpenseForm({ description: '', category: 'Maintenance', amount: '', date: new Date().toISOString().split('T')[0] });
      setIsExpenseModalOpen(false);
      showNotification("Expense added successfully");
  };

  const handleInvestmentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addInvestment({
          id: `INV-${Date.now()}`,
          investorName: investmentForm.description,
          amount: Number(investmentForm.amount),
          date: investmentForm.date,
          type: 'Seed'
      });
      setInvestmentForm({ description: '', category: 'Infrastructure', amount: '', date: new Date().toISOString().split('T')[0] });
      setIsInvestmentModalOpen(false);
      showNotification("Investment added successfully");
  };

  // Staff Form State
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  const handleAddTask = (staffId: string) => {
    if (newTask[staffId]) {
      addTask(staffId, newTask[staffId]);
      setNewTask(prev => ({ ...prev, [staffId]: '' }));
      showNotification("Task assigned");
    }
  };

  // Room Edit State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomPrice, setEditRoomPrice] = useState<number>(0);
  const [editRoomName, setEditRoomName] = useState<string>('');
  const [editRoomImage, setEditRoomImage] = useState<string>('');

  const startEditRoom = (room: any) => {
      setEditingRoomId(room.id);
      setEditRoomPrice(room.price);
      setEditRoomName(room.name);
      setEditRoomImage(room.image);
  };

  const saveRoom = () => {
      if (editingRoomId) {
          const room = rooms.find(r => r.id === editingRoomId);
          if (room) {
              updateRoom({ ...room, price: editRoomPrice, name: editRoomName, image: editRoomImage });
              showNotification("Room details updated");
          }
          setEditingRoomId(null);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        showNotification("Image updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const Sidebar = () => (
      <div className="w-64 bg-gradient-to-b from-urbane-darkGreen to-black text-white min-h-screen fixed left-0 top-0 pt-24 px-4 hidden md:flex flex-col z-10 shadow-2xl">
           <div className="space-y-3 flex-grow">
              <button onClick={() => setCurrentView('overview')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'overview' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <LayoutDashboard size={20} className={currentView === 'overview' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'overview' ? 'text-white' : 'text-gray-300'}`}>Overview</span>
              </button>
              <button onClick={() => setCurrentView('rooms')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'rooms' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <BedDouble size={20} className={currentView === 'rooms' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'rooms' ? 'text-white' : 'text-gray-300'}`}>Rooms & Pricing</span>
              </button>
              <button onClick={() => setCurrentView('bookings')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'bookings' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <Calendar size={20} className={currentView === 'bookings' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'bookings' ? 'text-white' : 'text-gray-300'}`}>Bookings</span>
              </button>
              <button onClick={() => setCurrentView('staff')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'staff' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <UserCheck size={20} className={currentView === 'staff' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'staff' ? 'text-white' : 'text-gray-300'}`}>Staff & Tasks</span>
              </button>
              <button onClick={() => setCurrentView('finance')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'finance' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <CreditCard size={20} className={currentView === 'finance' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'finance' ? 'text-white' : 'text-gray-300'}`}>Financials</span>
              </button>
              <button onClick={() => setCurrentView('settings')} className={`w-full flex items-center space-x-3 p-3.5 rounded-lg transition-all duration-300 ${currentView === 'settings' ? 'bg-white/10 border-l-4 border-urbane-gold shadow-lg backdrop-blur-sm' : 'hover:bg-white/5 hover:translate-x-1'}`}>
                  <Settings size={20} className={currentView === 'settings' ? 'text-urbane-gold' : 'text-gray-400'} /> 
                  <span className={`font-medium ${currentView === 'settings' ? 'text-white' : 'text-gray-300'}`}>Settings</span>
              </button>
          </div>
          <div className="mb-8 pt-6 border-t border-white/10">
            <button onClick={logoutAdmin} className="flex items-center space-x-2 text-red-300 hover:text-red-100 hover:bg-red-500/10 w-full p-3 rounded transition-colors">
                <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
      </div>
  );

  const MobileNav = () => (
    <div className="md:hidden mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-3 min-w-max">
            <button onClick={() => setCurrentView('overview')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'overview' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <LayoutDashboard size={16} /> <span>Overview</span>
            </button>
            <button onClick={() => setCurrentView('rooms')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'rooms' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <BedDouble size={16} /> <span>Rooms</span>
            </button>
            <button onClick={() => setCurrentView('bookings')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'bookings' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <Calendar size={16} /> <span>Bookings</span>
            </button>
            <button onClick={() => setCurrentView('staff')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'staff' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <UserCheck size={16} /> <span>Staff</span>
            </button>
            <button onClick={() => setCurrentView('finance')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'finance' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <CreditCard size={16} /> <span>Finance</span>
            </button>
            <button onClick={() => setCurrentView('settings')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${currentView === 'settings' ? 'bg-urbane-gold text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                <Settings size={16} /> <span>Settings</span>
            </button>
             <button onClick={logoutAdmin} className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors bg-red-50 text-red-500 border border-red-100">
                <LogOut size={16} /> <span>Logout</span>
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans relative">
      <Sidebar />
      
      <div className="md:ml-64 pt-24 pb-20 px-6 sm:px-8 lg:px-10 transition-all">
        
        <MobileNav />

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12">
          <div className="mb-4 md:mb-0">
            <h1 className="font-serif text-4xl font-bold text-urbane-charcoal capitalize tracking-tight">
              {currentView === 'finance' ? 'Financial Management' : currentView === 'staff' ? 'Staff & Task Management' : currentView}
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">Manage your property efficiently.</p>
          </div>
          {currentView === 'bookings' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-urbane-darkGreen text-white px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-urbane-gold hover:shadow-gold transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" /> New Booking
              </button>
          )}
          {currentView === 'rooms' && (
              <button 
                onClick={() => setIsRoomModalOpen(true)}
                className="bg-urbane-darkGreen text-white px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-urbane-gold hover:shadow-gold transition-all shadow-lg flex items-center"
              >
                <Plus size={18} className="mr-2" /> Add Room
              </button>
          )}
        </div>

        {notification && (
          <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl animate-fade-in-up z-50 flex items-center font-bold ${
            notification.type === 'success' ? 'bg-urbane-darkGreen text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="mr-3 h-5 w-5 text-urbane-gold" /> : <X className="mr-3 h-5 w-5" />}
            {notification.message}
          </div>
        )}

        {currentView === 'overview' && (
            <div className="animate-fade-in space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <StatCard title="Total Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon={DollarSign} trend="+12.5%" trendUp={true} />
                    <StatCard title="Net Profit" value={`₹${(netProfit/100000).toFixed(1)}L`} icon={TrendingUp} trend="+8.2%" trendUp={true} />
                    <StatCard title="Active Bookings" value={bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Checked Out').length} icon={Calendar} trend="-2.0%" trendUp={false} />
                    <StatCard title="Total Investment" value={`₹${(totalInvestment/100000).toFixed(1)}L`} icon={Briefcase} trend="Seed" trendUp={true} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-serif font-bold text-gray-800 text-xl">Revenue vs Expenses</h3>
                            <select className="text-xs bg-gray-50 border-none rounded p-2 text-gray-500 font-bold cursor-pointer hover:bg-gray-100 outline-none">
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8C5E45" stopOpacity={0.1}/> 
                                    <stop offset="95%" stopColor="#8C5E45" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#E74C3C" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'}} 
                                itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8C5E45" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                            <Area type="monotone" dataKey="expense" stroke="#E74C3C" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" name="Expense" />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                     <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                        <h3 className="font-serif font-bold text-gray-800 text-xl mb-6">Room Occupancy</h3>
                        <div className="h-64 flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-urbane-charcoal">{bookings.filter(b => b.status !== 'Cancelled').length}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Booked</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={5}
                            >
                                {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {entry.name}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {currentView === 'staff' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {staff.map(s => (
                        <div key={s.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                <h3 className="font-serif text-lg font-bold text-gray-800">{s.name}</h3>
                                <span className="text-xs font-bold text-urbane-gold uppercase tracking-wide">{s.role}</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-bold uppercase">{s.shift}</span>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                {s.tasks.map(task => (
                                <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer" onClick={() => toggleTask(s.id, task.id)}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {task.completed && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{task.description}</span>
                                </div>
                                ))}
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                                <input 
                                type="text" 
                                placeholder="Add new task..." 
                                className="flex-grow text-sm p-2 bg-gray-50 rounded border-none outline-none focus:ring-1 focus:ring-urbane-gold"
                                value={newTask[s.id] || ''}
                                onChange={(e) => setNewTask({...newTask, [s.id]: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTask(s.id)}
                                />
                                <button 
                                onClick={() => handleAddTask(s.id)}
                                className="p-2 bg-urbane-darkGreen text-white rounded hover:bg-urbane-gold transition-colors"
                                >
                                <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                
                <div className="bg-urbane-darkGreen text-white rounded-xl p-8 shadow-xl h-fit">
                    <h3 className="font-serif text-xl font-bold mb-2">Staff Management</h3>
                    <p className="text-sm text-gray-300 mb-6">Manage roster and daily tasks.</p>
                    <button className="w-full py-3 bg-urbane-gold text-urbane-darkGreen font-bold rounded uppercase tracking-widest hover:bg-white transition-colors mb-4">
                        + Add Staff Member
                    </button>
                    <div className="text-xs text-center text-white/50">
                        Contact Manager for shift changes
                    </div>
                </div>
            </div>
        )}

        {currentView === 'finance' && (
            <div className="animate-fade-in space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-warm-ivory text-opacity-70 text-sm mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-gold">₹{totalRevenue.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="text-green-400" size={32} />
                        </div>
                    </div>

                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-warm-ivory text-opacity-70 text-sm mb-1">Total Expenses</p>
                                <p className="text-2xl font-bold text-gold">₹{totalExpenses.toLocaleString()}</p>
                            </div>
                            <TrendingDown className="text-pink-400" size={32} />
                        </div>
                    </div>

                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-warm-ivory text-opacity-70 text-sm mb-1">Total Investments</p>
                                <p className="text-2xl font-bold text-gold">₹{totalInvestment.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="text-green-400" size={32} />
                        </div>
                    </div>
                        
                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-warm-ivory text-opacity-70 text-sm mb-1">Net Profit</p>
                                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{netProfit.toLocaleString()}
                                </p>
                            </div>
                            <TrendingDown className="text-pink-400" size={32} />
                        </div>
                    </div>
                </div>

                {/* Expenses by Category Chart */}
                <div className="glassmorphism-strong rounded-lg p-6">
                    <h2 className="text-xl font-serif text-gold mb-4">Expenses by Category</h2>
                    {(() => {
                        const expenseCategories = expenses.reduce((acc, exp) => {
                            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                            return acc;
                        }, {} as Record<string, number>);
                        const expenseChartData = Object.entries(expenseCategories).map(([name, value]) => ({
                            name,
                            value,
                        }));
                        const totalExpenseValue = expenseChartData.reduce((sum, item) => sum + item.value, 0);
                        const expenseChartDataWithPercent = expenseChartData.map(item => ({
                            ...item,
                            percent: totalExpenseValue > 0 ? ((item.value / totalExpenseValue) * 100).toFixed(0) : '0'
                        }));

                        return expenseChartDataWithPercent.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseChartDataWithPercent}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${percent}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseChartDataWithPercent.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1C1917',
                                            border: '1px solid #8C5E45',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-warm-ivory text-opacity-70 text-center py-12">No expense data</p>
                        );
                    })()}
                            </div>

                {/* Expenses and Investments Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expenses List */}
                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-serif text-gold">Expenses</h2>
                            <button
                                onClick={() => setIsExpenseModalOpen(true)}
                                className="bg-copper hover:bg-opacity-90 text-warm-ivory px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all"
                            >
                                <Plus size={16} />
                                <span>Add Expense</span>
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {expenses.length === 0 ? (
                                <p className="text-warm-ivory text-opacity-70 text-center py-4">No expenses recorded</p>
                            ) : (
                                expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="p-3 bg-deep-espresso rounded-lg border border-copper border-opacity-20"
                                    >
                                        <div className="flex justify-between items-start">
                             <div>
                                                <p className="font-semibold text-warm-ivory">{expense.description}</p>
                                                <p className="text-sm text-warm-ivory text-opacity-60">{expense.category}</p>
                                                <p className="text-xs text-warm-ivory text-opacity-50">
                                                    {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                            </div>
                                            <p className="font-bold text-red-300">₹{expense.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Investments List */}
                    <div className="glassmorphism-strong rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-serif text-gold">Investments</h2>
                            <button
                                onClick={() => setIsInvestmentModalOpen(true)}
                                className="bg-copper hover:bg-opacity-90 text-warm-ivory px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all"
                            >
                                <Plus size={16} />
                                <span>Add Investment</span>
                            </button>
                            </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {investments.length === 0 ? (
                                <p className="text-warm-ivory text-opacity-70 text-center py-4">No investments recorded</p>
                            ) : (
                                investments.map((investment) => (
                                    <div
                                        key={investment.id}
                                        className="p-3 bg-deep-espresso rounded-lg border border-copper border-opacity-20"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-warm-ivory">{investment.investorName}</p>
                                                <p className="text-sm text-warm-ivory text-opacity-60">{investment.type}</p>
                                                <p className="text-xs text-warm-ivory text-opacity-50">
                                                    {new Date(investment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <p className="font-bold text-green-300">₹{investment.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {currentView === 'settings' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
               <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center mb-8 pb-8 border-b border-gray-100">
                      <div className="w-12 h-12 bg-urbane-gold/10 rounded-full flex items-center justify-center mr-4">
                          <ImageIcon className="text-urbane-gold" size={24} />
                      </div>
                      <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-800">Site Appearance</h2>
                          <p className="text-gray-500 text-sm">Customize the visual branding of your website.</p>
                      </div>
                  </div>

                  <div className="space-y-12">
                      {/* Home Hero Image */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-700 mb-4">Home Hero Image</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                               <div className="col-span-2 relative h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group">
                                  <img src={homeHeroImage} alt="Home Hero" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-urbane-gold hover:text-white transition-colors">
                                          Change Image
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, updateHomeHeroImage)} />
                                      </label>
                                  </div>
                               </div>
                               <div className="text-sm text-gray-500">
                                   <p className="mb-2">Main banner on the landing page.</p>
                                   <p>Recommended: 1920×1080px.</p>
                               </div>
                          </div>
                      </div>

                      {/* Admin Background */}
                      <div>
                          <h3 className="text-sm font-bold text-gray-700 mb-4">Admin Login Background</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                               <div className="col-span-2 relative h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group">
                                  <img src={adminBackgroundImage} alt="Admin Background" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-urbane-gold hover:text-white transition-colors">
                                          Change Image
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, updateAdminBackgroundImage)} />
                                      </label>
                                  </div>
                               </div>
                               <div className="text-sm text-gray-500">
                                   <p className="mb-2">Background for the secure login page.</p>
                               </div>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
        )}

        {currentView === 'bookings' && (
            <div className="animate-fade-in bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Filters Row */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search guests..." className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-urbane-gold outline-none w-64" />
                    </div>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-urbane-darkGreen text-sm font-bold">
                        <Filter size={16} /> <span>Filter</span>
                    </button>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                            <th className="px-6 py-4 font-bold tracking-wider">Guest Details</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Room & Date</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Source</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Payment</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Status Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {bookings.map((booking) => {
                            const isEditing = !!editingRows[booking.id];
                            // Determine if row is locked based on status
                            const isLocked = booking.status === 'Checked Out' || booking.status === 'Cancelled';
                            const statusColor = {
                                'Pending': 'bg-yellow-100 text-yellow-800',
                                'Confirmed': 'bg-blue-100 text-blue-800',
                                'Checked In': 'bg-green-100 text-green-800',
                                'Checked Out': 'bg-gray-100 text-gray-600',
                                'Cancelled': 'bg-red-100 text-red-800'
                            }[booking.status];
                            
                            const paymentColor = {
                                'Paid': 'text-green-600',
                                'Pending': 'text-red-500',
                                'Partial': 'text-orange-500',
                                'Refunded': 'text-gray-500'
                            }[booking.paymentStatus];

                            return (
                                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{booking.guestName}</div>
                                        <div className="text-xs text-gray-400 mt-1">{booking.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{booking.roomName}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                                            <Calendar size={12} className="mr-1" />
                                            {new Date(booking.checkIn).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})} - {new Date(booking.checkOut).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded border border-gray-200 text-xs font-bold text-gray-500 uppercase bg-white">
                                            {booking.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">₹{booking.totalAmount.toLocaleString()}</div>
                                        
                                        {isLocked ? (
                                            <div className={`text-xs font-bold mt-1 uppercase tracking-wider ${paymentColor}`}>
                                                {booking.paymentStatus}
                                            </div>
                                        ) : (
                                            <select 
                                                className={`text-xs font-bold mt-1 uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer p-0 ${paymentColor}`}
                                                value={editingRows[booking.id]?.paymentStatus || booking.paymentStatus}
                                                onChange={(e) => handleBookingEdit(booking.id, 'paymentStatus', e.target.value)}
                                            >
                                                <option value="Paid" className="text-green-600">Paid</option>
                                                <option value="Pending" className="text-red-500">Pending</option>
                                                <option value="Partial" className="text-orange-500">Partial</option>
                                                <option value="Refunded" className="text-gray-500">Refunded</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            {isLocked ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center ${statusColor}`}>
                                                    <Lock size={10} className="mr-1" /> {booking.status}
                                                </span>
                                            ) : (
                                                <select 
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer ${statusColor}`}
                                                    value={editingRows[booking.id]?.status || booking.status}
                                                    onChange={(e) => handleBookingEdit(booking.id, 'status', e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Checked In">Checked In</option>
                                                    <option value="Checked Out">Checked Out</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            )}
                                            
                                            {isEditing && (
                                                <div className="flex items-center space-x-1 animate-fade-in">
                                                    <button onClick={() => saveBookingChanges(booking.id)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors">
                                                        <Check size={14} />
                                                    </button>
                                                    <button onClick={() => resetBookingChanges(booking.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {currentView === 'rooms' && (
             <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map(room => (
                    <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg group border border-gray-100">
                        <div className="relative h-48 overflow-hidden">
                             <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-urbane-green uppercase">
                                 {room.category}
                             </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-serif text-lg font-bold text-gray-800">{room.name}</h3>
                                {editingRoomId === room.id ? (
                                     <div className="flex space-x-2">
                                         <button onClick={saveRoom} className="p-1 bg-green-100 text-green-600 rounded"><Check size={14} /></button>
                                         <button onClick={() => setEditingRoomId(null)} className="p-1 bg-red-100 text-red-600 rounded"><X size={14} /></button>
                                     </div>
                                ) : (
                                     <button onClick={() => startEditRoom(room)} className="text-gray-400 hover:text-urbane-gold"><Settings size={16} /></button>
                                )}
                            </div>
                            
                            {editingRoomId === room.id ? (
                                <div className="space-y-3 mt-4">
                                     <input className="w-full p-2 text-sm border rounded" value={editRoomName} onChange={e => setEditRoomName(e.target.value)} placeholder="Name" />
                                     <input className="w-full p-2 text-sm border rounded" type="number" value={editRoomPrice} onChange={e => setEditRoomPrice(Number(e.target.value))} placeholder="Price" />
                                     <input className="w-full p-2 text-sm border rounded" value={editRoomImage} onChange={e => setEditRoomImage(e.target.value)} placeholder="Image URL" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-baseline mb-4">
                                        <span className="text-xl font-bold text-urbane-green">₹{room.price.toLocaleString()}</span>
                                        <span className="text-gray-500 text-xs ml-1">/ night</span>
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2">{room.description}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-urbane-darkGreen p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl font-bold">New Reservation</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddBooking} className="p-8 space-y-6">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guest Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={newBooking.guestName}
                    onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
                    required
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Room Type</label>
                      <select 
                        className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                        value={newBooking.roomName}
                        onChange={handleRoomChange}
                      >
                        {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Source</label>
                      <select 
                        className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                        value={newBooking.source}
                        onChange={(e) => setNewBooking({...newBooking, source: e.target.value as any})}
                      >
                        <option value="Website">Website</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Phone">Phone</option>
                        <option value="OTA">OTA</option>
                      </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <DatePicker 
                    label="Check In"
                    name="checkIn"
                    value={newBooking.checkIn}
                    onChange={handleBookingDateChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <DatePicker 
                    label="Check Out"
                    name="checkOut"
                    value={newBooking.checkOut}
                    onChange={handleBookingDateChange}
                    min={newBooking.checkIn ? getNextDay(newBooking.checkIn) : new Date().toISOString().split('T')[0]}
                  />
               </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Status</label>
                    <select 
                      className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                      value={newBooking.paymentStatus}
                      onChange={(e) => setNewBooking({...newBooking, paymentStatus: e.target.value as PaymentStatus})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={newBooking.amount}
                    readOnly
                    placeholder="Auto-calculated"
                  />
               </div>

               <button type="submit" className="w-full bg-urbane-gold text-white py-4 font-bold uppercase tracking-widest rounded hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  Confirm Booking
               </button>
            </form>
          </div>
        </div>
      )}

      {/* New Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-urbane-darkGreen p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl font-bold">Add New Room</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddRoom} className="p-8 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Room Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                    required
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                      <select 
                        className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                        value={newRoomData.category}
                        onChange={(e) => setNewRoomData({...newRoomData, category: e.target.value})}
                      >
                        {Object.values(RoomCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Occupancy</label>
                      <input 
                        type="number"
                        className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                        value={newRoomData.maxOccupancy}
                        onChange={(e) => setNewRoomData({...newRoomData, maxOccupancy: e.target.value})}
                        required
                      />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price per Night (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={newRoomData.price}
                    onChange={(e) => setNewRoomData({...newRoomData, price: e.target.value})}
                    required
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    placeholder="https://..."
                    value={newRoomData.image}
                    onChange={(e) => setNewRoomData({...newRoomData, image: e.target.value})}
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    placeholder="WiFi, Heater, Balcony..."
                    value={newRoomData.amenities}
                    onChange={(e) => setNewRoomData({...newRoomData, amenities: e.target.value})}
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none h-20"
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                  />
               </div>

               <button type="submit" className="w-full bg-urbane-gold text-white py-4 font-bold uppercase tracking-widest rounded hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  Add Room
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-urbane-darkGreen p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl font-bold">Add Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                  placeholder="e.g. AC Repair"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  required
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Salary">Salary</option>
                  <option value="Lease">Lease</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-urbane-gold text-white py-4 font-bold uppercase tracking-widest rounded hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {isInvestmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-urbane-darkGreen p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl font-bold">Add Investment</h3>
              <button onClick={() => setIsInvestmentModalOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleInvestmentSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                  placeholder="e.g. Initial Setup"
                  value={investmentForm.description}
                  onChange={(e) => setInvestmentForm({...investmentForm, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                  value={investmentForm.category}
                  onChange={(e) => setInvestmentForm({...investmentForm, category: e.target.value})}
                  required
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    placeholder="0.00"
                    value={investmentForm.amount}
                    onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-gray-50 rounded border border-gray-200 text-sm focus:border-urbane-gold outline-none"
                    value={investmentForm.date}
                    onChange={(e) => setInvestmentForm({...investmentForm, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-urbane-gold text-white py-4 font-bold uppercase tracking-widest rounded hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Add Investment
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
