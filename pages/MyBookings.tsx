import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CreditCard, Clock, AlertCircle, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  booking_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
  rooms?: {
    name: string;
    category: string;
    image_url: string;
  };
}

const MyBookings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name, category, image_url)
        `)
        .eq('guest_email', user?.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const canCancelBooking = (booking: Booking): { canCancel: boolean; reason?: string } => {
    if (booking.status === 'cancelled') {
      return { canCancel: false, reason: 'Already cancelled' };
    }
    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
      return { canCancel: false, reason: 'Cannot cancel after check-in' };
    }

    const checkInDate = new Date(booking.check_in);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 48) {
      return { canCancel: false, reason: 'Cancellation window closed (48 hours before check-in)' };
    }

    return { canCancel: true };
  };

  const handleCancelBooking = async (booking: Booking) => {
    const { canCancel, reason } = canCancelBooking(booking);
    if (!canCancel) {
      alert(reason);
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setCancellingId(booking.id);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: booking.payment_status === 'paid' ? 'refunded' : booking.payment_status,
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Refresh bookings
      await fetchBookings();
      alert('Booking cancelled successfully. If you had paid, a refund will be processed within 5-7 business days.');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please contact support.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const checkInDate = new Date(booking.check_in);
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return checkInDate >= now && booking.status !== 'cancelled';
      case 'past':
        return checkInDate < now || booking.status === 'checked_out';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const getStatusBadge = (status: Booking['status']) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={14} /> },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> },
      checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <MapPin size={14} /> },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <CheckCircle size={14} /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle size={14} /> },
    };
    const style = styles[status] || styles.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPaymentBadge = (status: Booking['payment_status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-urbane-mist flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-urbane-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-urbane-mist flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-urbane-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your bookings.
          </p>
          <Link
            to="/"
            className="inline-block bg-urbane-gold text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-urbane-mist">
      {/* Header */}
      <section className="bg-gradient-to-r from-urbane-darkGreen to-urbane-green py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-green-100">Manage your reservations at Urbane Haauz</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-urbane-gold text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${bookings.length})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-urbane-charcoal mb-2">
              {filter === 'all' ? 'No Bookings Yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't made any reservations with us yet."
                : `You don't have any ${filter} bookings.`}
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-urbane-gold text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
            >
              Book Now
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  booking.status === 'cancelled' ? 'opacity-75' : ''
                }`}
              >
                <div className="md:flex">
                  {/* Room Image */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={booking.rooms?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                      alt={booking.rooms?.name || 'Room'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Booking ID: {booking.booking_id}</p>
                        <h3 className="font-serif text-xl font-bold text-urbane-charcoal">
                          {booking.rooms?.name || 'Room'}
                        </h3>
                        <p className="text-sm text-gray-500">{booking.rooms?.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentBadge(booking.payment_status)}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} className="text-urbane-gold" />
                        <div>
                          <p className="text-xs text-gray-400">Check-in</p>
                          <p className="font-medium">{new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} className="text-urbane-gold" />
                        <div>
                          <p className="text-xs text-gray-400">Check-out</p>
                          <p className="font-medium">{new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} className="text-urbane-gold" />
                        <div>
                          <p className="text-xs text-gray-400">Guests</p>
                          <p className="font-medium">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard size={18} className="text-urbane-gold" />
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-urbane-charcoal">₹{booking.total_price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      {canCancelBooking(booking).canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Cancel Booking
                            </>
                          )}
                        </button>
                      )}
                      {!canCancelBooking(booking).canCancel && booking.status !== 'cancelled' && (
                        <span className="text-sm text-gray-500 italic">
                          {canCancelBooking(booking).reason}
                        </span>
                      )}
                      <Link
                        to={`/contact?subject=Booking ${booking.booking_id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Need Help?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            Cancellation Policy
          </h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Free cancellation up to 48 hours before check-in</li>
            <li>• Cancellations within 48 hours of check-in are non-refundable</li>
            <li>• Refunds (if applicable) are processed within 5-7 business days</li>
            <li>• For special circumstances, please contact us directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
