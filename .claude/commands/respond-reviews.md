# /respond-reviews

Draft a response to a guest review. Pass the review text and platform as arguments.

## Usage
```
/respond-reviews [platform] [rating] [review text]
```

Example:
```
/respond-reviews google 5 "Amazing stay! The Kanchenjunga view from our room was breathtaking. Staff was very helpful."
```

## What this command does

1. Parse the platform (google/booking_com/agoda/tripadvisor/goibibo), rating (1-5), and review text
2. Use the `review-responder` agent to draft a response following brand guidelines
3. Insert into Supabase `marketing_reviews` table
4. Send draft to Telegram for founder approval

## If no arguments provided
Prompt the user for: platform, rating, reviewer name (optional), review text.
