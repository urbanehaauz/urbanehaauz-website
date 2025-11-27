// Test Supabase Connection
// Run this in browser console (F12 → Console) to test direct API access

// Get your values from .env.local
const SUPABASE_URL = 'https://lqvccvtsydzptgsrncmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdmNjdnRzeWR6cHRnc3JuY216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjYxMzksImV4cCI6MjA3OTc0MjEzOX0.EkcTvD4u8Jf6sS4tfwTwNugj3XvRcyOrdP_R5k6w45o';

console.log('🧪 Testing Supabase connection...');

fetch(`${SUPABASE_URL}/rest/v1/rooms?select=*`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
})
.then(async response => {
  console.log('📡 Response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
})
.then(data => {
  console.log('✅ Success! Rooms fetched:', data);
  console.log('📊 Number of rooms:', data.length);
  if (data.length > 0) {
    console.log('📦 First room:', data[0]);
  } else {
    console.warn('⚠️ No rooms in response (empty array)');
  }
})
.catch(error => {
  console.error('💥 Error fetching rooms:', error);
  console.error('Full error:', error);
});

