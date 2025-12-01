import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Room } from '../types';
import { CheckCircle, Calendar, CreditCard, ChevronRight, Lock } from 'lucide-react';
import DatePicker from '../components/DatePicker';

const BookingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rooms, addBooking } = useApp();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const initialRoomId = queryParams.get('room');

  // Load persisted booking state from sessionStorage
  const loadBookingState = () => {
    try {
      const saved = sessionStorage.getItem('urbane-booking-state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading booking state:', error);
    }
    return null;
  };

  const savedState = loadBookingState();

  // State - Initialize from sessionStorage if available
  const [step, setStep] = useState(savedState?.step || 1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(() => {
    if (initialRoomId) {
      return rooms.find(r => r.id === initialRoomId) || null;
    }
    if (savedState?.selectedRoomId) {
      return rooms.find(r => r.id === savedState.selectedRoomId) || null;
    }
    return null;
  });
  const [dates, setDates] = useState(savedState?.dates || { checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(savedState?.guests || { name: '', email: '', phone: '', count: 1 });

  // Pre-fill guest info if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setGuests(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.user_metadata?.full_name || prev.name,
      }));
    }
  }, [user]);

  // Persist booking state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        step,
        selectedRoomId: selectedRoom?.id || null,
        dates,
        guests
      };
      sessionStorage.setItem('urbane-booking-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving booking state:', error);
    }
  }, [step, selectedRoom, dates, guests]);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  // Helpers
  const getNextDay = (dateStr: string) => {
      if (!dateStr) return '';
      // Parse YYYY-MM-DD string in local timezone to avoid UTC shifts
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const date = new Date(y, m - 1, d);
        // Add 1 day
        date.setDate(date.getDate() + 1);
        // Return YYYY-MM-DD in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return '';
  };

  // Handlers
  const handleDateChange = (name: string, value: string) => {
    if (name === 'checkIn') {
        // If check-in changes, we must validate check-out
        // Check-out must be strictly GREATER than check-in
        if (dates.checkOut && dates.checkOut <= value) {
            // Reset check-out if it is invalid (less than or equal to new check-in)
            setDates(prev => ({ ...prev, checkIn: value, checkOut: '' }));
        } else {
            setDates(prev => ({ ...prev, [name]: value }));
        }
    } else {
        setDates(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validate guest count doesn't exceed room capacity
    if (name === 'count' && selectedRoom) {
      const guestCount = parseInt(value);
      if (guestCount > selectedRoom.maxOccupancy) {
        // Prevent setting guest count higher than max capacity
        return;
      }
    }

    setGuests({ ...guests, [name]: value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const calculateTotal = () => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 0) return selectedRoom.price; 
    return diffDays * selectedRoom.price;
  };

  const handlePayment = () => {
    setPaymentProcessing(true);

    setTimeout(() => {
      const bookingId = `BK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
      const newBooking = {
        id: bookingId,
        guestName: guests.name,
        email: guests.email,
        phone: guests.phone,
        roomName: selectedRoom?.name || 'Unknown Room',
        roomId: selectedRoom?.id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        totalAmount: calculateTotal(),
        status: 'Confirmed' as const,
        paymentStatus: 'Paid' as const,
        source: 'Website' as const,
        dateCreated: new Date().toISOString().split('T')[0]
      };

      addBooking(newBooking);
      setGeneratedBookingId(bookingId);
      setPaymentProcessing(false);
      setBookingComplete(true);

      // Clear the persisted booking state after successful booking
      try {
        sessionStorage.removeItem('urbane-booking-state');
      } catch (error) {
        console.error('Error clearing booking state:', error);
      }
    }, 2000);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-urbane-mist px-4 font-sans">
        <div className="bg-white p-10 shadow-2xl text-center max-w-lg w-full border-t-4 border-urbane-gold">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12 text-urbane-green" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-urbane-charcoal mb-4">Confirmed!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you, {guests.name}. Your mountain getaway is booked. We have sent the confirmation details to <span className="font-semibold text-urbane-green">{guests.email}</span>.
          </p>
          <div className="bg-gray-50 p-6 mb-8 text-left text-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Booking ID</p>
                    <p className="font-bold text-gray-900">#{generatedBookingId}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Room</p>
                    <p className="font-bold text-gray-900">{selectedRoom?.name}</p>
                </div>
                <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wider">Check-in</p>
                     <p className="font-bold text-gray-900">{dates.checkIn}</p>
                </div>
                 <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wider">Total Paid</p>
                     <p className="font-bold text-urbane-green">₹{calculateTotal().toLocaleString('en-IN')}</p>
                </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-urbane-charcoal text-white py-4 font-bold tracking-widest uppercase hover:bg-urbane-green transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-urbane-mist font-sans">
      <div className="max-w-6xl mx-auto px-4">
        {/* Stepper */}
        <div className="flex justify-center mb-16">
            <div className="flex items-center w-full max-w-md justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-300 -z-10"></div>
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-urbane-gold -z-10 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

                <div className={`flex flex-col items-center bg-urbane-mist px-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= 1 ? 'bg-urbane-gold text-white' : 'bg-gray-300 text-gray-500'}`}>1</div>
                    <span className="text-xs font-bold mt-2 uppercase tracking-wider text-gray-600">Details</span>
                </div>

                <div className={`flex flex-col items-center bg-urbane-mist px-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= 2 ? 'bg-urbane-gold text-white' : 'bg-gray-300 text-gray-500'}`}>2</div>
                    <span className="text-xs font-bold mt-2 uppercase tracking-wider text-gray-600">Guest</span>
                </div>

                <div className={`flex flex-col items-center bg-urbane-mist px-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= 3 ? 'bg-urbane-gold text-white' : 'bg-gray-300 text-gray-500'}`}>3</div>
                    <span className="text-xs font-bold mt-2 uppercase tracking-wider text-gray-600">Payment</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Sidebar / Summary */}
            <div className="w-full lg:w-1/3 bg-white p-8 shadow-soft sticky top-28 order-2 lg:order-1">
              <h3 className="font-serif text-2xl font-bold text-urbane-charcoal mb-6 pb-4 border-b border-gray-100">Reservation Summary</h3>
              {selectedRoom ? (
                <div className="space-y-6">
                  <div className="relative h-40 rounded overflow-hidden">
                    <img src={selectedRoom.image} alt="Room" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 w-full bg-black/50 p-2 text-white text-xs font-bold uppercase">
                        {selectedRoom.category}
                    </div>
                  </div>
                  <div>
                    <p className="font-serif text-xl font-bold text-urbane-green leading-tight">{selectedRoom.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded space-y-3 text-sm border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-in</span>
                      <span className="font-bold text-gray-800">{dates.checkIn || 'Select Date'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out</span>
                      <span className="font-bold text-gray-800">{dates.checkOut || 'Select Date'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-bold text-gray-800">{guests.count} Adult(s)</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-sm">Total Amount</span>
                      <span className="text-3xl font-serif font-bold text-urbane-gold">₹{calculateTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Please select a room to view summary.</p>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="w-full lg:w-2/3 bg-white p-8 lg:p-12 shadow-soft order-1 lg:order-2">
              
              {/* STEP 1: Selection */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="border-b pb-4 border-gray-100">
                      <h2 className="text-3xl font-serif font-bold text-urbane-charcoal">Dates & Room</h2>
                      <p className="text-gray-500 mt-2">Choose when you'd like to stay with us.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DatePicker 
                      label="Check-in Date"
                      name="checkIn"
                      value={dates.checkIn}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <DatePicker 
                      label="Check-out Date"
                      name="checkOut"
                      value={dates.checkOut}
                      onChange={handleDateChange}
                      min={dates.checkIn ? getNextDay(dates.checkIn) : new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {!initialRoomId && (
                    <div className="mt-8">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Available Rooms</label>
                      {rooms.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>No rooms available at the moment.</p>
                          <p className="text-sm mt-1">Please check back later or contact us.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                          {rooms.filter(room => room.available).map(room => (
                            <div 
                              key={room.id}
                              onClick={() => setSelectedRoom(room)}
                              className={`group flex flex-col sm:flex-row border cursor-pointer transition-all duration-300 hover:shadow-md ${selectedRoom?.id === room.id ? 'border-urbane-gold bg-amber-50/30' : 'border-gray-100 hover:border-urbane-gold/50'}`}
                            >
                              <div className="sm:w-40 h-32 sm:h-auto relative overflow-hidden">
                                  <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
                              </div>
                              <div className="p-5 flex-grow flex flex-col justify-center">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <span className="text-xs font-bold text-urbane-gold uppercase">{room.category}</span>
                                          <h4 className="font-serif text-lg font-bold text-gray-800">{room.name}</h4>
                                      </div>
                                      <div className="text-right">
                                          <span className="block font-serif text-xl font-bold text-urbane-green">₹{room.price}</span>
                                          <span className="text-xs text-gray-400">/night</span>
                                      </div>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-2">{room.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={nextStep}
                    disabled={!selectedRoom || !dates.checkIn || !dates.checkOut}
                    className="w-full mt-4 bg-urbane-charcoal text-white py-4 font-bold uppercase tracking-widest hover:bg-urbane-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    Continue to Guest Details <ChevronRight size={18} className="ml-2" />
                  </button>
                </div>
              )}

              {/* STEP 2: Guest Info */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in-up">
                   <div className="border-b pb-4 border-gray-100">
                      <h2 className="text-3xl font-serif font-bold text-urbane-charcoal">Guest Information</h2>
                      <p className="text-gray-500 mt-2">Who will be staying with us?</p>
                      {user && (
                        <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
                          ✓ Logged in as {user.email} - Your information has been pre-filled
                        </div>
                      )}
                      {!user && (
                        <p className="text-xs text-gray-400 mt-2">
                          <Link to="/" className="text-urbane-gold hover:underline font-medium">
                            Sign in
                          </Link> (via navbar) to auto-fill your details
                        </p>
                      )}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="w-full p-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-urbane-gold focus:ring-1 focus:ring-urbane-gold outline-none transition-all"
                        placeholder="e.g. Rahul Verma"
                        value={guests.name}
                        onChange={handleGuestChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          className="w-full p-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-urbane-gold focus:ring-1 focus:ring-urbane-gold outline-none transition-all"
                          placeholder="name@example.com"
                          value={guests.email}
                          onChange={handleGuestChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          className="w-full p-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-urbane-gold focus:ring-1 focus:ring-urbane-gold outline-none transition-all"
                          placeholder="+91 98765 43210"
                          value={guests.phone}
                          onChange={handleGuestChange}
                        />
                      </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Number of Guests</label>
                       <select
                          name="count"
                          className="w-full p-4 bg-white border border-gray-200 text-gray-900 focus:border-urbane-gold focus:ring-1 focus:ring-urbane-gold outline-none transition-all cursor-pointer"
                          value={guests.count}
                          onChange={handleGuestChange}
                        >
                         {[...Array(selectedRoom?.maxOccupancy || 4)].map((_, i) => (
                           <option key={i + 1} value={i + 1} className="text-gray-900 bg-white">{i + 1} Guest{i > 0 ? 's' : ''}</option>
                         ))}
                       </select>
                       <p className="text-xs text-gray-500 mt-2">
                         Maximum capacity for this room: <span className="font-bold text-urbane-gold">{selectedRoom?.maxOccupancy || 4} guests</span>
                       </p>
                       {selectedRoom && guests.count > selectedRoom.maxOccupancy && (
                         <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                           <strong>⚠️ Capacity Exceeded:</strong> This room can accommodate a maximum of {selectedRoom.maxOccupancy} guests.
                           {selectedRoom.maxOccupancy === 4 && selectedRoom.category === 'Dormitory' && (
                             <span> For groups larger than 4, please book multiple rooms or contact us for assistance.</span>
                           )}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={prevStep}
                      className="w-1/3 border border-gray-300 text-gray-600 py-4 font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={
                        !guests.name ||
                        !guests.email ||
                        !guests.phone ||
                        (selectedRoom && guests.count > selectedRoom.maxOccupancy)
                      }
                      className="w-2/3 bg-urbane-charcoal text-white py-4 font-bold uppercase tracking-widest hover:bg-urbane-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Review & Pay
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="border-b pb-4 border-gray-100">
                      <h2 className="text-3xl font-serif font-bold text-urbane-charcoal">Secure Payment</h2>
                      <p className="text-gray-500 mt-2 flex items-center"><Lock size={14} className="mr-1" /> TLS Encrypted Transaction</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-6 border-l-4 border-blue-500 text-blue-900 mb-6">
                    <p className="font-bold mb-1">Demo Mode</p>
                    <p className="text-sm">No actual payment will be deducted. Clicking the button below will confirm your booking immediately.</p>
                  </div>

                  <div className="border border-gray-200 p-6 transition-all hover:border-urbane-gold hover:shadow-md cursor-pointer bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-5 w-5 rounded-full border-2 border-urbane-gold flex items-center justify-center mr-4">
                                <div className="h-2.5 w-2.5 rounded-full bg-urbane-gold"></div>
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">Razorpay Secure</span>
                                <span className="text-xs text-gray-500">Credit Card, Debit Card, UPI, NetBanking</span>
                            </div>
                        </div>
                        <CreditCard className="text-gray-400" />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                     <button 
                      onClick={prevStep}
                      className="w-1/3 border border-gray-300 text-gray-600 py-4 font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePayment}
                      disabled={paymentProcessing}
                      className="w-2/3 bg-gradient-to-r from-urbane-gold to-yellow-600 text-white py-4 font-bold uppercase tracking-widest hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex justify-center items-center"
                    >
                      {paymentProcessing ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        `Pay ₹${calculateTotal().toLocaleString('en-IN')}`
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;