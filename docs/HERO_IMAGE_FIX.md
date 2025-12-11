# Hero Image Fix - Implementation Summary

## Issues Fixed

### 1. ✅ Default Image Not Showing
**Problem**: Default hero image wasn't accessible in production because it wasn't in the `public` folder.

**Solution**: 
- Copied `lib/hero-image.png` to `public/lib/hero-image.png`
- Images in the `public` folder are served from the root URL (`/lib/hero-image.png`)

### 2. ✅ Settings Only Loaded for Admins
**Problem**: Hero image settings were only loaded when `isAdmin` was true, so regular users never saw admin-updated images.

**Solution**: 
- Updated `AppContext.tsx` to load settings for ALL users (not just admins)
- Hero image is now a public setting that everyone can read
- Admin background image still only loads for admins

### 3. ✅ Image Upload Using Data URLs
**Problem**: Admin image uploads were converted to base64 data URLs and stored in localStorage, which:
- Only worked in the admin's session
- Wasn't accessible to other users
- Created huge localStorage entries

**Solution**: 
- Implemented proper Supabase Storage upload
- Images are now uploaded to Supabase Storage bucket `images`
- Public URLs are saved to the database
- All users see the same uploaded image

### 4. ✅ RLS Policy for Public Settings Read
**Problem**: Settings table had RLS that only allowed admins to read settings.

**Solution**: 
- Created SQL script to add public read policy for settings
- All users can now read settings (hero image)
- Only admins can update settings (existing policy maintained)

## Files Changed

1. **`context/AppContext.tsx`**
   - Changed settings loading to work for all users
   - Improved error handling in image update functions

2. **`pages/AdminDashboard.tsx`**
   - Updated `handleImageUpload` to upload to Supabase Storage
   - Added file validation (type and size)
   - Added proper error handling with fallback

3. **`public/lib/hero-image.png`**
   - Added default hero image to public folder

4. **`database/sql/add_public_settings_read_policy.sql`**
   - New SQL script to add public read access to settings

## Required Supabase Setup

### 1. Create Storage Bucket

In Supabase Dashboard → Storage:

1. Click **"New bucket"**
2. Name: `images`
3. **Public bucket**: ✅ Check this (so images are publicly accessible)
4. Click **"Create bucket"**

### 2. Set Bucket Policies

After creating the bucket, set these policies:

**Public Read Access:**
```sql
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

**Admin Upload Access:**
```sql
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

**Admin Delete Access:**
```sql
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

### 3. Add Public Read Policy for Settings

Run this SQL in Supabase SQL Editor:

```sql
-- Allow public read access to settings table
CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);
```

Or run the file: `database/sql/add_public_settings_read_policy.sql`

## Testing Checklist

- [ ] Default hero image shows on homepage for all users
- [ ] Admin can upload new hero image
- [ ] Uploaded image is visible to all users (not just admin)
- [ ] Image persists after page refresh
- [ ] Image persists across different browsers/sessions
- [ ] Storage bucket `images` is created and public
- [ ] RLS policies are set correctly

## How It Works Now

1. **Default Image**: 
   - Stored at `public/lib/hero-image.png`
   - Served from `/lib/hero-image.png`
   - Set as default in database seed

2. **Admin Upload**:
   - Admin selects image file
   - File is uploaded to Supabase Storage (`images` bucket)
   - Public URL is saved to `settings` table
   - All users see the new image immediately

3. **Image Loading**:
   - On app load, settings are fetched for ALL users
   - Hero image URL is loaded from database
   - Falls back to default if no setting exists

## Notes

- Image uploads are limited to 5MB
- Only image files are accepted
- Admin must be logged in to upload images
- Images are stored permanently in Supabase Storage
- Public URLs are saved, so images persist across sessions

