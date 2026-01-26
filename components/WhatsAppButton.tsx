import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { HOTEL_CONTACT } from './Footer';

const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickMessages = [
    { label: 'Book a Room', message: "Hi! I'd like to book a room at Urbane Haauz." },
    { label: 'Check Availability', message: "Hi! I want to check room availability for specific dates." },
    { label: 'Room Prices', message: "Hi! Can you share the room rates and packages?" },
    { label: 'General Inquiry', message: "Hi! I have some questions about Urbane Haauz." },
  ];

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${HOTEL_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Quick Message Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 bg-white rounded-2xl shadow-2xl w-80 overflow-hidden animate-fade-in-up">
          <div className="bg-green-500 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">Chat with us</h3>
                <p className="text-sm text-green-100">Typically replies within minutes</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-green-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm text-gray-600 mb-3">Start a conversation:</p>
            {quickMessages.map((item, index) => (
              <button
                key={index}
                onClick={() => openWhatsApp(item.message)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-sm font-medium text-gray-700"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
            Powered by WhatsApp
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-600 rotate-90' : 'bg-green-500 hover:bg-green-600'
        }`}
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <MessageCircle size={28} className="text-white" />
        )}
      </button>

      {/* Pulse animation for attention */}
      {!isOpen && (
        <span className="fixed bottom-6 right-4 z-40 p-4 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </>
  );
};

export default WhatsAppButton;
