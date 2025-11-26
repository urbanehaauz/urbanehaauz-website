import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Sun, Wifi, Coffee, ChevronRight, Star } from 'lucide-react';
import { TESTIMONIALS, ROOMS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

const Home: React.FC = () => {
  const { homeHeroImage } = useApp();

  return (
    <div className="flex flex-col w-full font-sans">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
            <img
              src={homeHeroImage}
              alt="Golden Sunrise over Kanchenjunga"
              className="w-full h-full object-cover"
            />
            {/* Neutral dark overlay to ensure text readability without green tint */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10 pt-20">
          <span className="text-white uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-semibold animate-fade-in-up border-b border-white/50 pb-2 drop-shadow-md">
            The Himalayas Await
          </span>
          <h1 className="font-serif text-5xl md:text-8xl text-white font-normal mb-6 max-w-5xl leading-none text-shadow drop-shadow-xl">
            Urbane <span className="text-white italic font-light">Haauz</span>
          </h1>
          <p className="font-serif text-white/90 text-base md:text-xl mb-12 max-w-2xl italic tracking-wide leading-relaxed drop-shadow-md">
            - Where luxury meets the clouds.
          </p>
          <Link
            to="/book"
            className="group bg-white text-urbane-green px-10 py-4 hover:bg-urbane-gold hover:text-white transition-all duration-300 text-sm font-bold tracking-[0.2em] uppercase shadow-lg hover:shadow-gold transform hover:-translate-y-1"
          >
            Check Availability
          </Link>

          {/* Weather Widget Mock */}
          <div className="absolute bottom-10 right-10 hidden md:flex items-center space-x-6 bg-white/10 backdrop-blur-md p-6 rounded-none border-l-2 border-urbane-gold shadow-2xl">
            <div className="text-white text-right">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Pelling, Sikkim</p>
              <p className="font-serif text-3xl">12°C</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <Sun className="text-urbane-gold h-10 w-10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-white relative">
          <div className="max-w-3xl mx-auto text-center px-6">
             <p className="text-urbane-gold font-serif italic text-2xl mb-6">"Where Mountains Meet Modern Comfort"</p>
             <h2 className="font-serif text-4xl md:text-5xl text-urbane-charcoal font-bold mb-8 leading-tight">
                 Experience the Magic of <br/> Kanchenjunga
             </h2>
             <p className="text-gray-600 leading-loose text-lg">
                 Nestled in the heart of West Sikkim, Urbane Haauz offers an escape from the ordinary. 
                 Whether you are a backpacker seeking adventure or a family looking for serenity, 
                 our doors open to the majestic views of the third highest peak in the world.
             </p>
             <div className="mt-10 flex justify-center">
                <div className="w-1 h-16 bg-urbane-gold"></div>
             </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-urbane-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { icon: Cloud, title: "Panoramic Views", text: "Uninterrupted sunrise views from every balcony." },
                { icon: Wifi, title: "Modern Essentials", text: "High-speed fiber internet & 24/7 power backup." },
                { icon: Coffee, title: "Authentic Dining", text: "Organic Sikkimese cuisine & craft beverages." }
            ].map((feature, idx) => (
                <div key={idx} className="bg-white p-10 shadow-soft hover:shadow-xl transition-all duration-500 group border-t-4 border-transparent hover:border-urbane-gold">
                    <feature.icon className="h-12 w-12 text-urbane-green mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-serif text-2xl font-bold mb-4 text-urbane-charcoal">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.text}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <span className="text-urbane-gold uppercase tracking-widest font-semibold text-xs">Accommodation</span>
              <h2 className="font-serif text-4xl md:text-5xl text-urbane-charcoal font-bold mt-3">Curated Spaces</h2>
              <p className="mt-4 text-gray-500">Designed for comfort, styled for luxury.</p>
            </div>
            <Link to="/rooms" className="group flex items-center text-urbane-charcoal font-medium hover:text-urbane-gold transition-colors mt-6 md:mt-0">
              View All Rooms <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {ROOMS.slice(0, 2).map((room) => (
              <div key={room.id} className="group relative overflow-hidden shadow-2xl h-[500px] cursor-pointer">
                 <div className="absolute inset-0">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
                </div>
                <div className="absolute bottom-0 left-0 p-10 text-white w-full">
                  <div className="flex justify-between items-end border-b border-white/20 pb-6 mb-6">
                      <div>
                        <p className="text-urbane-gold text-xs uppercase tracking-widest font-bold mb-2">{room.category}</p>
                        <h3 className="font-serif text-3xl font-bold">{room.name}</h3>
                      </div>
                  </div>
                  <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                          <span className="text-xs opacity-70 uppercase">Starting from</span>
                          <span className="text-2xl font-serif">₹{room.price.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/book?room=${room.id}`} className="bg-white text-urbane-charcoal px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-urbane-gold hover:text-white transition-colors">
                        Book Now
                      </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-urbane-darkGreen text-white relative overflow-hidden">
         <div className="max-w-6xl mx-auto px-4 relative z-10">
           <div className="text-center mb-16">
                <Star className="h-8 w-8 text-urbane-gold mx-auto mb-4 fill-current" />
                <h2 className="font-serif text-4xl font-bold mb-4">Guest Stories</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <div key={t.id} className="bg-white/5 p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <p className="font-serif text-xl leading-relaxed italic text-gray-200 mb-8">"{t.text}"</p>
                  <div className="flex items-center">
                      <div className="w-10 h-10 bg-urbane-gold rounded-full flex items-center justify-center text-urbane-darkGreen font-bold font-serif">
                          {t.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                          <p className="font-bold text-sm uppercase tracking-wide">{t.name}</p>
                          <div className="flex text-urbane-gold mt-1">
                            {[...Array(t.rating)].map((_, i) => (
                                <Star key={i} size={12} fill="currentColor" />
                            ))}
                          </div>
                      </div>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="font-serif text-5xl text-urbane-charcoal font-bold mb-6">
             Your Mountain Home Awaits
           </h2>
           <p className="text-gray-500 mb-10 text-lg max-w-2xl mx-auto">
             Escape the chaos. Embrace the clouds. Book directly with us for exclusive welcome perks and guaranteed best rates.
           </p>
           <Link 
             to="/book"
             className="inline-block bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white px-12 py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold tracking-widest uppercase text-sm"
           >
             Reserve Your Stay
           </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;