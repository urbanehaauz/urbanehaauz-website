-- Quick Script to Create and Promote Admin User
-- Run this in Supabase SQL Editor

-- Step 1: Replace 'your-email@example.com' with your admin email
-- Step 2: This will create the user profile if it doesn't exist, or update if it does

-- IMPORTANT: First create the user in Supabase Dashboard:
-- Authentication → Users → Add user → Enter email/password → Check "Auto Confirm User"

-- Then run this to make them admin:
UPDATE user_profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- If the user doesn't exist in user_profiles yet, you'll need their UUID
-- To get UUID: Supabase → Authentication → Users → Click on user → Copy the UUID
-- Then run:
-- INSERT INTO user_profiles (id, email, is_admin)
-- VALUES ('PASTE_UUID_HERE', 'your-email@example.com', true)
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Verify admin status
SELECT id, email, is_admin, created_at 
FROM user_profiles 
WHERE email = 'your-email@example.com';

