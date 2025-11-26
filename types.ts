// Existing Types
export enum RoomCategory {
  DORM = 'Dormitory',
  STANDARD = 'Standard Room',
  DELUXE = 'Deluxe Room',
  PREMIUM = 'Premium Suite'
}

export interface Amenity {
  icon: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  price: number;
  maxOccupancy: number;
  image: string;
  description: string;
  amenities: string[];
  available: boolean;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
export type BookingSource = 'Website' | 'OTA' | 'Walk-in' | 'Phone';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Refunded';

export interface Booking {
  id: string;
  guestName: string;
  email?: string;
  phone?: string;
  roomName: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  dateCreated: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  shift: 'Morning' | 'Evening' | 'Night';
  tasks: Task[];
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export interface Investment {
  id: string;
  investorName: string;
  amount: number;
  date: string;
  type: 'Seed' | 'Loan' | 'Equity';
}

export interface Expense {
  id: string;
  description: string;
  category: 'Operations' | 'Maintenance' | 'Lease' | 'Salary' | 'Marketing' | 'Supplies';
  amount: number;
  date: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalInvestment: number;
  netProfit: number;
}