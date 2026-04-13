# /weekly-report

Generate and send the weekly marketing performance report via Telegram.

## What this command does

1. Query Supabase `marketing_content` for content generated/approved/posted in the last 7 days
2. Query Supabase `marketing_reviews` for review activity in the last 7 days
3. Query Supabase `marketing_metrics` for the current week's data (if entered)
4. Compile a formatted summary
5. Send to the Telegram Marketing Bot

## Steps

### Step 1: Query content stats
```sql
SELECT status, COUNT(*) FROM marketing_content
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY status;
```

### Step 2: Query review stats
```sql
SELECT status, COUNT(*) FROM marketing_reviews
WHERE detected_at >= NOW() - INTERVAL '7 days'
GROUP BY status;
```

### Step 3: Query metrics
```sql
SELECT * FROM marketing_metrics
WHERE week_start >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY week_start DESC LIMIT 1;
```

### Step 4: Compile + send
Use the `report-generator` agent to format and send via Telegram.

## Usage
```
/weekly-report
```
