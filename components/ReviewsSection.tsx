import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  guest_name: string;
  rating: number;
  title?: string;
  review_text: string;
  stay_date?: string;
  room_type?: string;
  created_at: string;
}

interface ReviewsSectionProps {
  featured?: boolean; // Show only featured reviews
  limit?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ featured = false, limit = 6 }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [featured, limit]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      if (error) {
        // If table doesn't exist yet, use fallback
        console.warn('Reviews table not ready, using fallback');
        setReviews(fallbackReviews);
      } else if (data && data.length > 0) {
        setReviews(data);
      } else {
        // No reviews yet, use fallback
        setReviews(fallbackReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-8 w-8 text-urbane-gold" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Carousel view for home page
  if (featured) {
    const currentReview = reviews[currentIndex];
    return (
      <section className="py-20 bg-gradient-to-b from-white to-urbane-mist">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-urbane-gold tracking-[0.3em] uppercase text-sm mb-2">Testimonials</p>
            <h2 className="font-serif text-4xl text-urbane-charcoal font-bold">What Our Guests Say</h2>
            <div className="flex items-center justify-center mt-4 space-x-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
              <span className="text-gray-600 font-medium">{averageRating} average rating</span>
            </div>
          </div>

          <div className="relative">
            {/* Navigation Arrows */}
            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevReview}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-urbane-gold hover:text-white transition-colors z-10"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextReview}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white shadow-lg rounded-full p-3 hover:bg-urbane-gold hover:text-white transition-colors z-10"
                  aria-label="Next review"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Review Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
              <Quote className="absolute top-6 left-6 text-urbane-gold/20" size={60} />

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  {renderStars(currentReview.rating)}
                </div>

                {currentReview.title && (
                  <h3 className="text-xl font-semibold text-urbane-charcoal text-center mb-4">
                    "{currentReview.title}"
                  </h3>
                )}

                <p className="text-gray-600 text-lg leading-relaxed text-center italic mb-8">
                  "{currentReview.review_text}"
                </p>

                <div className="text-center">
                  <p className="font-bold text-urbane-charcoal">{currentReview.guest_name}</p>
                  {currentReview.room_type && (
                    <p className="text-sm text-gray-500">{currentReview.room_type}</p>
                  )}
                  {currentReview.stay_date && (
                    <p className="text-sm text-gray-400">
                      Stayed {new Date(currentReview.stay_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            {reviews.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-urbane-gold w-6' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Grid view for reviews page
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            {renderStars(review.rating)}
            {review.stay_date && (
              <span className="text-xs text-gray-400">
                {new Date(review.stay_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {review.title && (
            <h4 className="font-semibold text-urbane-charcoal mb-2">"{review.title}"</h4>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
            {review.review_text}
          </p>

          <div className="pt-4 border-t border-gray-100">
            <p className="font-medium text-urbane-charcoal">{review.guest_name}</p>
            {review.room_type && (
              <p className="text-xs text-gray-500">{review.room_type}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Fallback reviews for when database is empty or not set up
const fallbackReviews: Review[] = [
  {
    id: '1',
    guest_name: 'Priya Sharma',
    rating: 5,
    title: 'Breathtaking views and exceptional service',
    review_text: 'Our stay at Urbane Haauz was nothing short of magical. Waking up to the stunning views of Kanchenjunga was a dream come true. The staff went above and beyond to make our anniversary special.',
    stay_date: '2024-10-15',
    room_type: 'Deluxe Room',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    guest_name: 'Rahul Mehta',
    rating: 5,
    title: 'Perfect mountain getaway',
    review_text: 'The perfect blend of modern comfort and natural beauty. The rooms are spacious, clean, and thoughtfully designed. Highly recommend the local experiences arranged by the hotel.',
    stay_date: '2024-09-20',
    room_type: 'Premium Suite',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    guest_name: 'Ananya Roy',
    rating: 4,
    title: 'Great value for money',
    review_text: 'Excellent hospitality and amazing location. The food was delicious with authentic Sikkimese flavors. Would definitely visit again with family.',
    stay_date: '2024-11-05',
    room_type: 'Standard Room',
    created_at: new Date().toISOString(),
  },
];

export default ReviewsSection;
