import React, { useState } from 'react';
import { CreditCard, Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { HOTEL_CONTACT } from './Footer';
import { supabase } from '../lib/supabase';

interface PaymentButtonProps {
  amount: number; // Amount in INR
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  onSuccess?: (paymentId: string, orderId: string, signature: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

// Razorpay key will be loaded from environment
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Check if Razorpay is configured
const isRazorpayConfigured = !!RAZORPAY_KEY;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  bookingId,
  guestName,
  guestEmail,
  guestPhone,
  roomType,
  checkIn,
  checkOut,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!isRazorpayConfigured) {
      setShowOfflineModal(true);
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order server-side so the secret key never touches the browser
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        { body: { bookingId, amount } },
      );

      if (orderError || !orderData?.order_id) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Urbane Haauz',
        description: `Room Booking - ${roomType}`,
        image: '/logo.png',
        order_id: orderData.order_id,
        handler: function (response: any) {
          console.log('Payment successful:', response);
          if (onSuccess) {
            onSuccess(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
            );
          }
        },
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone,
        },
        notes: {
          booking_id: bookingId,
          check_in: checkIn,
          check_out: checkOut,
          room_type: roomType,
        },
        theme: {
          color: '#1B4332', // urbane-darkGreen
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        if (onError) {
          onError(response.error.description || 'Payment failed');
        }
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      if (onError) {
        onError(error.message || 'Failed to initiate payment');
      }
      setLoading(false);
    }
  };

  // Format amount for display
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <>
      <div className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-urbane-darkGreen">{formattedAmount}</span>
          </div>
          <div className="text-xs text-gray-500">
            Inclusive of all taxes and fees
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={disabled || loading}
          className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all flex items-center justify-center space-x-3 ${
            disabled || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              <span>Pay {formattedAmount}</span>
            </>
          )}
        </button>

        {/* Security Badges */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2">
          <div className="flex items-center space-x-1">
            <Shield size={14} className="text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock size={14} className="text-green-600" />
            <span>SSL Encrypted</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>We accept UPI, Cards, Net Banking & Wallets</p>
          <div className="flex justify-center items-center space-x-3 mt-2 opacity-60">
            <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods/visa.svg" alt="Visa" width={40} height={20} loading="lazy" decoding="async" className="h-5" />
            <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods/mastercard.svg" alt="Mastercard" width={40} height={20} loading="lazy" decoding="async" className="h-5" />
            <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods/rupay.svg" alt="RuPay" width={40} height={20} loading="lazy" decoding="async" className="h-5" />
            <img src="https://cdn.razorpay.com/static/assets/logo/payment_methods/upi.svg" alt="UPI" width={40} height={20} loading="lazy" decoding="async" className="h-5" />
          </div>
        </div>

        {/* Razorpay not configured message */}
        {!isRazorpayConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <div className="flex items-start space-x-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Online payment coming soon!</p>
                <p className="text-xs mt-1">Contact us to complete your booking.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offline Payment Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="bg-urbane-darkGreen p-6 text-white rounded-t-xl">
              <h3 className="font-serif text-xl font-bold">Complete Your Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-green-800">Booking Saved!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your booking has been saved. Complete payment via:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Option 1: WhatsApp Payment</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Send payment screenshot and booking ID via WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I'd like to complete payment for Booking ID: ${bookingId}. Amount: ${formattedAmount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <span>WhatsApp Us</span>
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Option 2: Call Us</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Call to confirm booking and arrange payment
                  </p>
                  <a
                    href={`tel:${HOTEL_CONTACT.phoneClean}`}
                    className="inline-flex items-center space-x-2 bg-urbane-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    <span>{HOTEL_CONTACT.phone}</span>
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Option 3: Pay at Check-in</h4>
                  <p className="text-sm text-gray-600">
                    Pay the full amount when you arrive at the hotel
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p><strong>Booking ID:</strong> {bookingId}</p>
                <p><strong>Amount Due:</strong> {formattedAmount}</p>
              </div>

              <button
                onClick={() => setShowOfflineModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;
