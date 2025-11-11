-- Reschedule all 5 cron jobs with staggered schedules
-- This prevents race conditions and reduces database load

-- First, unschedule all existing jobs
SELECT cron.unschedule('update_auction_status');
SELECT cron.unschedule('process-seller-auction-end');
SELECT cron.unschedule('trigger-seller-email-notifications');
SELECT cron.unschedule('process-dealer-post-seller-decisions');
SELECT cron.unschedule('update-auction-outcomes-edge-function');

-- Now reschedule them with staggered times (every 30 minutes at different offsets)

-- Job #23: update_auction_status - runs at :00 and :30
SELECT cron.schedule(
  'update_auction_status',
  '0,30 * * * *',
  $$
  UPDATE cars 
  SET status = 'sold', 
      auction_status = 'ended',
      updated_at = NOW()
  WHERE is_auction = true 
    AND auction_end_time <= NOW() 
    AND auction_status = 'active'
    AND id IN (
      SELECT DISTINCT car_id 
      FROM bids 
      WHERE created_at <= NOW()
    );
  $$
);

-- Job #24: process-seller-auction-end - runs at :05 and :35
SELECT cron.schedule(
  'process-seller-auction-end',
  '5,35 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdvakfhmoaoucmhbhwvy.supabase.co/functions/v1/close-ended-auctions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmFrZmhtb2FvdWNtaGJod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1OTEsImV4cCI6MjA1MDM2ODU5MX0.wvvxbqF3Hg_fmQ_4aJCqISQvcFXhm-2BngjvO6EHL0M"}'::jsonb
  ) as request_id;
  $$
);

-- Job #25: trigger-seller-email-notifications - runs at :10 and :40
SELECT cron.schedule(
  'trigger-seller-email-notifications',
  '10,40 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdvakfhmoaoucmhbhwvy.supabase.co/functions/v1/send-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmFrZmhtb2FvdWNtaGJod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1OTEsImV4cCI6MjA1MDM2ODU5MX0.wvvxbqF3Hg_fmQ_4aJCqISQvcFXhm-2BngjvO6EHL0M"}'::jsonb,
    body := '{"type": "auction_ended"}'::jsonb
  ) as request_id;
  $$
);

-- Job #26: process-dealer-post-seller-decisions - runs at :15 and :45
SELECT cron.schedule(
  'process-dealer-post-seller-decisions',
  '15,45 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdvakfhmoaoucmhbhwvy.supabase.co/functions/v1/admin-api',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmFrZmhtb2FvdWNtaGJod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1OTEsImV4cCI6MjA1MDM2ODU5MX0.wvvxbqF3Hg_fmQ_4aJCqISQvcFXhm-2BngjvO6EHL0M"}'::jsonb,
    body := '{"action": "process_seller_decisions"}'::jsonb
  ) as request_id;
  $$
);

-- Job #29: update-auction-outcomes-edge-function - runs at :20 and :50
SELECT cron.schedule(
  'update-auction-outcomes-edge-function',
  '20,50 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdvakfhmoaoucmhbhwvy.supabase.co/functions/v1/admin-api',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmFrZmhtb2FvdWNtaGJod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1OTEsImV4cCI6MjA1MDM2ODU5MX0.wvvxbqF3Hg_fmQ_4aJCqISQvcFXhm-2BngjvO6EHL0M"}'::jsonb,
    body := '{"action": "update_auction_outcomes"}'::jsonb
  ) as request_id;
  $$
);