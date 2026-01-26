/**
 * Room Availability Service
 *
 * Handles real-time availability checking against bookings database
 */

import { supabase } from './supabase';

interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflictingBookings?: string[];
  reason?: string;
}

interface RoomWithAvailability {
  id: string;
  name: string;
  category: string;
  price: number;
  max_occupancy: number;
  image: string;
  description: string;
  amenities: string[];
  available: boolean;
  isBookedForDates: boolean;
}

interface SeasonalPricing {
  multiplier: number;
  seasonName: string;
}

/**
 * Check if a specific room is available for given dates
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityCheckResult> {
  try {
    // Query for any overlapping bookings that are not cancelled
    const { data: conflictingBookings, error } = await supabase
      .from('bookings')
      .select('id, booking_id, check_in, check_out, status')
      .eq('room_id', roomId)
      .neq('status', 'Cancelled')
      .neq('status', 'cancelled')
      .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`);

    if (error) {
      console.error('Availability check error:', error);
      return {
        isAvailable: false,
        reason: 'Unable to check availability. Please try again.',
      };
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return {
        isAvailable: false,
        conflictingBookings: conflictingBookings.map(b => b.booking_id || b.id),
        reason: 'Room is already booked for some of these dates',
      };
    }

    return { isAvailable: true };
  } catch (err) {
    console.error('Availability check error:', err);
    return {
      isAvailable: false,
      reason: 'Error checking availability',
    };
  }
}

/**
 * Get all available rooms for given dates
 */
export async function getAvailableRooms(
  checkIn: string,
  checkOut: string
): Promise<RoomWithAvailability[]> {
  try {
    // First, get all rooms that are generally available
    const { data: allRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('available', true);

    if (roomsError || !allRooms) {
      console.error('Error fetching rooms:', roomsError);
      return [];
    }

    // Get all bookings that overlap with the requested dates
    const { data: bookedRooms, error: bookingsError } = await supabase
      .from('bookings')
      .select('room_id')
      .neq('status', 'Cancelled')
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError);
      // Return all rooms but mark as potentially unavailable
      return allRooms.map(room => ({
        ...room,
        isBookedForDates: false, // Unknown
      }));
    }

    // Create a set of booked room IDs
    const bookedRoomIds = new Set(bookedRooms?.map(b => b.room_id) || []);

    // Mark each room's availability
    return allRooms.map(room => ({
      ...room,
      isBookedForDates: bookedRoomIds.has(room.id),
    }));
  } catch (err) {
    console.error('Error getting available rooms:', err);
    return [];
  }
}

/**
 * Get booked dates for a specific room (for calendar display)
 */
export async function getRoomBookedDates(
  roomId: string,
  startDate: string,
  endDate: string
): Promise<{ start: string; end: string }[]> {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('room_id', roomId)
      .neq('status', 'Cancelled')
      .neq('status', 'cancelled')
      .gte('check_out', startDate)
      .lte('check_in', endDate);

    if (error) {
      console.error('Error fetching booked dates:', error);
      return [];
    }

    return (bookings || []).map(b => ({
      start: b.check_in,
      end: b.check_out,
    }));
  } catch (err) {
    console.error('Error getting booked dates:', err);
    return [];
  }
}

/**
 * Get seasonal pricing multiplier for a date range
 */
export async function getSeasonalPricing(
  checkIn: string,
  checkOut: string,
  roomCategory?: string
): Promise<SeasonalPricing> {
  try {
    let query = supabase
      .from('seasonal_pricing')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', checkOut)
      .gte('end_date', checkIn);

    if (roomCategory) {
      query = query.or(`room_category.is.null,room_category.eq.${roomCategory}`);
    }

    const { data: seasonalRates, error } = await query;

    if (error || !seasonalRates || seasonalRates.length === 0) {
      return { multiplier: 1, seasonName: 'Standard' };
    }

    // If multiple seasonal rates apply, use the one with highest multiplier
    const highestRate = seasonalRates.reduce((max, rate) =>
      rate.price_multiplier > max.price_multiplier ? rate : max
    );

    return {
      multiplier: highestRate.price_multiplier,
      seasonName: highestRate.name,
    };
  } catch (err) {
    console.error('Error getting seasonal pricing:', err);
    return { multiplier: 1, seasonName: 'Standard' };
  }
}

/**
 * Calculate total price with seasonal adjustments
 */
export async function calculateTotalPrice(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  roomCategory?: string,
  promoCode?: string
): Promise<{
  baseTotal: number;
  seasonalMultiplier: number;
  seasonName: string;
  discountAmount: number;
  promoApplied: boolean;
  finalTotal: number;
  nights: number;
}> {
  // Calculate number of nights
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get seasonal pricing
  const seasonal = await getSeasonalPricing(checkIn, checkOut, roomCategory);

  // Calculate base total with seasonal adjustment
  const baseTotal = basePrice * nights;
  const seasonalTotal = Math.round(baseTotal * seasonal.multiplier);

  // Check promo code
  let discountAmount = 0;
  let promoApplied = false;

  if (promoCode) {
    const promoResult = await validatePromoCode(promoCode, seasonalTotal, roomCategory);
    if (promoResult.valid) {
      discountAmount = promoResult.discountAmount;
      promoApplied = true;
    }
  }

  const finalTotal = seasonalTotal - discountAmount;

  return {
    baseTotal,
    seasonalMultiplier: seasonal.multiplier,
    seasonName: seasonal.seasonName,
    discountAmount,
    promoApplied,
    finalTotal: Math.max(0, finalTotal),
    nights,
  };
}

/**
 * Validate and calculate promo code discount
 */
export async function validatePromoCode(
  code: string,
  bookingAmount: number,
  roomCategory?: string
): Promise<{
  valid: boolean;
  discountAmount: number;
  message: string;
}> {
  try {
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .single();

    if (error || !promo) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Invalid or expired promo code',
      };
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.times_used >= promo.usage_limit) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Promo code usage limit reached',
      };
    }

    // Check minimum booking amount
    if (bookingAmount < promo.min_booking_amount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum booking amount of ₹${promo.min_booking_amount} required`,
      };
    }

    // Check room category restriction
    if (promo.applicable_room_types && roomCategory) {
      if (!promo.applicable_room_types.includes(roomCategory)) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'Promo code not applicable for this room type',
        };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (promo.discount_type === 'percentage') {
      discountAmount = Math.round((bookingAmount * promo.discount_value) / 100);
      // Apply max discount cap if set
      if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
        discountAmount = promo.max_discount_amount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    return {
      valid: true,
      discountAmount,
      message: `${promo.description || 'Promo applied'} - You save ₹${discountAmount}!`,
    };
  } catch (err) {
    console.error('Promo validation error:', err);
    return {
      valid: false,
      discountAmount: 0,
      message: 'Error validating promo code',
    };
  }
}

/**
 * Increment promo code usage (call after successful booking)
 */
export async function incrementPromoUsage(code: string): Promise<void> {
  try {
    await supabase.rpc('increment_promo_usage', { promo_code: code.toUpperCase() });
  } catch (err) {
    console.error('Error incrementing promo usage:', err);
  }
}
