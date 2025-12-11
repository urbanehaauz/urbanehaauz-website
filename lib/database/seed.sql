-- Seed initial data
-- Run this AFTER schema.sql

-- Insert initial rooms
INSERT INTO rooms (name, category, price, max_occupancy, image, description, amenities, available) VALUES
('Backpacker Dorm (Mixed)', 'Dormitory', 800, 1, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop', 'Cozy bunk beds with personal reading lights, lockers, and mountain views. Perfect for solo travelers.', ARRAY['Free WiFi', 'Lockers', 'Shared Lounge', 'Hot Water'], true),
('Kanchenjunga View Standard', 'Standard Room', 3500, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop', 'Comfortable double room with essential amenities and a direct view of the valley.', ARRAY['King Bed', 'WiFi', 'Room Heater', 'Tea/Coffee Maker'], true),
('Cloud Mist Deluxe', 'Deluxe Room', 5000, 3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', 'Spacious room with a private balcony overlooking the Himalayas. Includes breakfast.', ARRAY['Balcony', 'Breakfast Included', 'Smart TV', 'Mini Bar'], true),
('Royal Summit Suite', 'Premium Suite', 7500, 4, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop', 'Our finest suite with a separate living area, bathtub, and panoramic 180-degree views.', ARRAY['Living Room', 'Bathtub', 'Welcome Drink', 'Dedicated Service'], false)
ON CONFLICT (name) DO NOTHING;

-- Insert initial settings (default hero image)
-- The image is stored in public/lib/hero-image.png and served from /lib/hero-image.png
INSERT INTO settings (key, value) VALUES
('home_hero_image', '/lib/hero-image.png'),
('admin_background_image', '/lib/hero-image.png')
ON CONFLICT (key) DO NOTHING;

