-- Add public read access to settings table for hero image
-- This allows all users (including non-authenticated) to read the hero image setting
-- Only admins can update settings (existing policy)

-- Allow public read access to settings
CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

-- Note: The existing "Admins can manage settings" policy already covers INSERT/UPDATE/DELETE
-- This new policy only adds SELECT (read) access for everyone

