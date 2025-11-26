import { Room, RoomCategory, Booking, Staff, Investment, Expense } from '../types';

export const ROOMS: Room[] = [
  {
    id: '1',
    name: 'Backpacker Dorm (Mixed)',
    category: RoomCategory.DORM,
    price: 800,
    maxOccupancy: 1,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop',
    description: 'Cozy bunk beds with personal reading lights, lockers, and mountain views. Perfect for solo travelers.',
    amenities: ['Free WiFi', 'Lockers', 'Shared Lounge', 'Hot Water'],
    available: true
  },
  {
    id: '2',
    name: 'Kanchenjunga View Standard',
    category: RoomCategory.STANDARD,
    price: 3500,
    maxOccupancy: 2,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop',
    description: 'Comfortable double room with essential amenities and a direct view of the valley.',
    amenities: ['King Bed', 'WiFi', 'Room Heater', 'Tea/Coffee Maker'],
    available: true
  },
  {
    id: '3',
    name: 'Cloud Mist Deluxe',
    category: RoomCategory.DELUXE,
    price: 5000,
    maxOccupancy: 3,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    description: 'Spacious room with a private balcony overlooking the Himalayas. Includes breakfast.',
    amenities: ['Balcony', 'Breakfast Included', 'Smart TV', 'Mini Bar'],
    available: true
  },
  {
    id: '4',
    name: 'Royal Summit Suite',
    category: RoomCategory.PREMIUM,
    price: 7500,
    maxOccupancy: 4,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop',
    description: 'Our finest suite with a separate living area, bathtub, and panoramic 180-degree views.',
    amenities: ['Living Room', 'Bathtub', 'Welcome Drink', 'Dedicated Service'],
    available: false
  }
];

export const RECENT_BOOKINGS: Booking[] = [
  {
    id: 'BK-2025-001',
    guestName: 'Rahul Sharma',
    roomName: 'Cloud Mist Deluxe',
    checkIn: '2025-03-10',
    checkOut: '2025-03-14',
    totalAmount: 20000,
    status: 'Checked Out',
    paymentStatus: 'Paid',
    source: 'Website',
    dateCreated: '2025-02-15'
  },
  {
    id: 'BK-2025-002',
    guestName: 'Sarah Jenkins',
    roomName: 'Backpacker Dorm',
    checkIn: '2025-03-12',
    checkOut: '2025-03-13',
    totalAmount: 800,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'OTA',
    dateCreated: '2025-03-01'
  },
  {
    id: 'BK-2025-003',
    guestName: 'Amit Patel',
    roomName: 'Royal Summit Suite',
    checkIn: '2025-04-01',
    checkOut: '2025-04-05',
    totalAmount: 30000,
    status: 'Pending',
    paymentStatus: 'Pending',
    source: 'Walk-in',
    dateCreated: '2025-03-05'
  }
];

export const MOCK_STAFF: Staff[] = [
  {
    id: 'S1',
    name: 'Rajesh Kumar',
    role: 'Housekeeping Manager',
    shift: 'Morning',
    tasks: [
      { id: 'T1', description: 'Inspect Room 201', completed: false },
      { id: 'T2', description: 'Laundry Inventory', completed: true }
    ]
  },
  {
    id: 'S2',
    name: 'Sunita Sherpa',
    role: 'Receptionist',
    shift: 'Evening',
    tasks: [
      { id: 'T3', description: 'Guest Check-ins', completed: false },
      { id: 'T4', description: 'Update Log Book', completed: false }
    ]
  }
];

export const MOCK_INVESTMENTS: Investment[] = [
  { id: 'INV1', investorName: 'Souvik', amount: 600000, date: '2025-01-01', type: 'Seed' },
  { id: 'INV2', investorName: 'Shovit', amount: 600000, date: '2025-01-01', type: 'Seed' },
  { id: 'INV3', investorName: 'Ayan', amount: 600000, date: '2025-01-01', type: 'Seed' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'EXP1', description: 'Initial Renovations', category: 'Maintenance', amount: 200000, date: '2025-01-10' },
  { id: 'EXP2', description: 'Marketing Campaign FB', category: 'Marketing', amount: 15000, date: '2025-02-01' },
  { id: 'EXP3', description: 'Kitchen Supplies', category: 'Operations', amount: 50000, date: '2025-02-05' },
  { id: 'EXP4', description: 'Staff Salaries (Feb)', category: 'Salary', amount: 85000, date: '2025-02-28' },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya D.",
    text: "The view from the balcony is literally breathtaking. Waking up to Kanchenjunga was a dream.",
    rating: 5
  },
  {
    id: 2,
    name: "Mark T.",
    text: "Great vibe in the dorms. Met amazing people. The staff is super helpful with trekking guides.",
    rating: 5
  },
  {
    id: 3,
    name: "The Kapoor Family",
    text: "Food was delicious, felt like home. The deluxe room was very spacious for our kids.",
    rating: 4
  }
];