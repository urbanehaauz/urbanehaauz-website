import React, { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ReviewFormProps {
  bookingId?: string;
  roomType?: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookingId, roomType, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 20) {
      setError('Please write at least 20 characters in your review');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('reviews').insert({
        user_id: user?.id || null,
        booking_id: bookingId || null,
        guest_name: guestName.trim() || 'Anonymous Guest',
        guest_email: user?.email || null,
        rating,
        title: title.trim() || null,
        review_text: reviewText.trim(),
        room_type: roomType || null,
        stay_date: new Date().toISOString().split('T')[0],
        is_approved: false, // Requires admin approval
        is_featured: false,
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setRating(0);
      setTitle('');
      setReviewText('');

      if (onSuccess) onSuccess();

      // Reset after showing success
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-green-800 mb-2">
          Thank You for Your Review!
        </h3>
        <p className="text-green-600">
          Your review has been submitted and will be published after approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h3 className="font-serif text-xl font-bold text-urbane-charcoal mb-6">
        Share Your Experience
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {rating === 0 && 'Click to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>

      {/* Guest Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none"
          placeholder="Your name (or leave blank for anonymous)"
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none"
          placeholder="Summarize your experience"
        />
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          required
          minLength={20}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none resize-none"
          placeholder="Tell us about your stay - what did you love? Any suggestions?"
        />
        <p className="text-xs text-gray-500 mt-1">
          {reviewText.length}/20 characters minimum
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white py-3 rounded-lg font-bold tracking-wider uppercase hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Submit Review</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Reviews are moderated and will be published within 24-48 hours
      </p>
    </form>
  );
};

export default ReviewForm;
