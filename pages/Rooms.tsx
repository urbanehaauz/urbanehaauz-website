import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wifi, Square, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoomCategory } from '../types';

const Rooms: React.FC = () => {
  const { rooms, loading } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredRooms = filterCategory === 'All' 
    ? rooms 
    : rooms.filter(room => room.category === filterCategory);

  const categories = ['All', ...Object.values(RoomCategory)];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-urbane-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-urbane-green font-bold mb-4">Our Accommodation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From cozy backpacker dorms to luxurious suites with Kanchenjunga views, we have a space for every traveler.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-urbane-green text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urbane-green mx-auto mb-4"></div>
            <p className="text-gray-500">Loading rooms...</p>
            <p className="text-gray-400 text-xs mt-2">Check console (F12) for details</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later or contact us.</p>
            <p className="text-gray-400 text-xs mt-4">Debug: Check browser console (F12) for loading logs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {!room.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 font-bold rounded transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-urbane-green uppercase tracking-wide">
                    {room.category}
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl font-bold text-gray-900">{room.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-urbane-green">₹{room.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 text-sm ml-1">/ night</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {room.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-500">
                        <Check size={12} className="text-urbane-gold mr-1.5" />
                        {amenity}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users size={16} className="mr-1.5" />
                      <span>Up to {room.maxOccupancy} Guests</span>
                    </div>
                    <Link 
                      to={`/book?room=${room.id}`}
                      className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                        room.available 
                          ? 'bg-urbane-green text-white hover:bg-urbane-lightGreen' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => !room.available && e.preventDefault()}
                    >
                      {room.available ? 'Book Now' : 'Unavailable'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;