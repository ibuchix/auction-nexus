

# Delete Ford Transit (2019) and All Related Data

## Vehicle Identified

| Field | Value |
|-------|-------|
| Car ID | `b47cf001-781b-4b1a-b9b7-a6995f0e1080` |
| Title | 2019 FORD TRANSIT |
| VIN | WF0EXXTTREKU85913 |
| Seller | Łukasz Filip (filiplukasz@gmail.com, +664 499 306) |
| Seller ID | `a5be6e9f-5d11-4719-9b86-1f5fb973327e` |
| Status | ended, 0 bids |
| Auction ended | 2026-03-14 22:47 UTC |

## Data to Delete

| Table | Records |
|-------|---------|
| `car_file_uploads` | 19 (1 video + 18 images) |
| `cars_history` | 26 |
| `auction_schedules` | 1 |
| `notifications` | 1 |
| `cars` | 1 |
| bids, auction_metrics, auction_results, auction_closure_details, dealer_won_vehicles, dealer_wishlists, dealer_purchases, dealer_reviews, email_notification_events, disputes, audit_logs | 0 each |

**Note**: The 19 files in Supabase Storage (bucket `car-images`) will NOT be deleted by the SQL migration -- storage files must be cleaned separately or will be caught by the existing `cleanup-old-vehicle-files` edge function. The SQL migration only removes database records.

## Migration SQL

A single migration that deletes all database records for this car across every related table, in dependency order (children first, then the car itself). The seller account is NOT deleted -- only this car's data.

```sql
DO $$
DECLARE
  target_car_id uuid := 'b47cf001-781b-4b1a-b9b7-a6995f0e1080';
BEGIN
  DELETE FROM car_file_uploads WHERE car_id = target_car_id;
  DELETE FROM cars_history WHERE car_id = target_car_id;
  DELETE FROM auction_schedules WHERE car_id = target_car_id;
  DELETE FROM auction_metrics WHERE car_id = target_car_id;
  DELETE FROM auction_results WHERE car_id = target_car_id;
  DELETE FROM auction_closure_details WHERE car_id = target_car_id;
  DELETE FROM bids WHERE car_id = target_car_id;
  DELETE FROM dealer_won_vehicles WHERE car_id = target_car_id;
  DELETE FROM dealer_wishlists WHERE car_id = target_car_id;
  DELETE FROM dealer_purchases WHERE car_id = target_car_id;
  DELETE FROM dealer_reviews WHERE car_id = target_car_id;
  DELETE FROM email_notification_events WHERE car_id = target_car_id;
  DELETE FROM disputes WHERE car_id = target_car_id;
  DELETE FROM notifications WHERE related_entity_id = target_car_id::text;
  DELETE FROM audit_logs WHERE entity_id = target_car_id;
  DELETE FROM cars WHERE id = target_car_id;

  RAISE NOTICE 'All data for Ford Transit % deleted.', target_car_id;
END;
$$;
```

No code changes needed -- this is a one-time data operation via migration.

