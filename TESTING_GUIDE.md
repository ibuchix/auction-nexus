# Auction Extension Testing Guide

## Step 4: Comprehensive Testing Checklist

This guide will help you verify that the auction extension feature works correctly and maintains data consistency across all tables.

---

## 🧪 Testing Prerequisites

Before testing, ensure:
- [ ] You have at least one active auction (38 cars are currently scheduled)
- [ ] You have admin access to the system
- [ ] You're on the `/admin/auctions/manage` page
- [ ] The Active Auctions tab shows running auctions

---

## ✅ Test Suite

### Test 1: Basic Extension Functionality

**Objective:** Verify the extension dialog works and updates the database

**Steps:**
1. Navigate to Active Auctions tab
2. Find an auction ending soon (check the "Ends in" timer)
3. Click the "Extend Time" button
4. **Expected:** Dialog opens with preset time options
5. Select "1 hour" extension
6. **Optional:** Add a reason like "Testing extension feature"
7. Click "Extend Auction"
8. **Expected:** Success toast appears: "Auction Extended - Extended by 1 hour"
9. **Expected:** Dialog closes automatically
10. **Expected:** Auction end time updates immediately in the UI

**✓ Pass Criteria:**
- Dialog displays correctly with all time options
- Success message appears
- UI updates without page refresh

---

### Test 2: Data Consistency Verification

**Objective:** Verify both `cars` and `auction_schedules` tables are updated atomically

**Method 1: Using Browser Console**

Open the browser console (F12) and run:

```javascript
// Replace with your car ID
const carId = 'your-car-id-here';

// Import the test utility
import { testDataConsistency } from './src/utils/testAuctionExtension';

// Run the test
const result = await testDataConsistency(carId);
console.log('Data Consistency Test:', result);
```

**Method 2: Using Supabase SQL Editor**

Go to: https://supabase.com/dashboard/project/sdvakfhmoaoucmhbhwvy/sql/new

```sql
-- Check data consistency for a specific car
-- Replace 'CAR_ID_HERE' with actual car ID

SELECT 
  'cars' as source,
  c.id as car_id,
  c.auction_end_time,
  c.is_manually_controlled,
  c.updated_at
FROM cars c
WHERE c.id = 'CAR_ID_HERE'

UNION ALL

SELECT 
  'auction_schedules' as source,
  asch.car_id,
  asch.end_time as auction_end_time,
  asch.is_manually_controlled,
  asch.updated_at
FROM auction_schedules asch
WHERE asch.car_id = 'CAR_ID_HERE'
  AND asch.status = 'running';
```

**✓ Pass Criteria:**
- `auction_end_time` (cars) matches `end_time` (auction_schedules)
- Both `is_manually_controlled` flags are `true`
- Both `updated_at` timestamps are recent (within last few seconds)
- Time difference between both end times is < 1 second

---

### Test 3: Audit Log Verification

**Objective:** Confirm audit trail is created for compliance

**SQL Query:**

```sql
-- View recent audit logs for auction extensions
SELECT 
  id,
  entity_id as car_id,
  user_id as extended_by,
  created_at as extended_at,
  details->>'old_end_time' as old_end_time,
  details->>'new_end_time' as new_end_time,
  details->>'hours_added' as hours_added,
  details->>'reason' as reason
FROM audit_logs
WHERE action = 'extend_auction'
  AND entity_type = 'auction'
ORDER BY created_at DESC
LIMIT 10;
```

**✓ Pass Criteria:**
- New audit log entry exists
- `old_end_time` and `new_end_time` are correct
- `hours_added` matches your selection
- `reason` is captured (if provided)
- `extended_by` matches your user ID

---

### Test 4: Schedule Notes Update

**Objective:** Verify extension details are appended to schedule notes

**SQL Query:**

```sql
-- Check schedule notes for a specific car
SELECT 
  car_id,
  notes,
  updated_at,
  last_status_change
FROM auction_schedules
WHERE car_id = 'CAR_ID_HERE'
  AND status = 'running';
```

**✓ Pass Criteria:**
- Notes contain: "🕐 Extended at [timestamp]"
- Notes show: "From: [old time]"
- Notes show: "To: [new time]"
- Notes show: "Duration: [hours] hours"
- If reason provided: "Reason: [your reason]"

---

### Test 5: Real-Time Updates

**Objective:** Verify changes propagate to all connected clients

**Steps:**
1. Open the admin dashboard in two browser windows/tabs
2. In Window 1: Extend an auction
3. In Window 2: Watch the auction card
4. **Expected:** End time updates automatically in Window 2
5. **Expected:** "Manually controlled" badge appears/updates

**✓ Pass Criteria:**
- Real-time update appears within 2-3 seconds
- No page refresh required
- All auction details update correctly

---

### Test 6: Edge Cases

#### Test 6.1: Extend Already Extended Auction
**Steps:**
1. Extend an auction by 1 hour
2. Immediately extend it again by 2 hours
3. **Expected:** Both extensions succeed
4. **Expected:** Total extension is 3 hours from original time

**Verification Query:**
```sql
SELECT 
  entity_id,
  created_at,
  details->>'hours_added' as hours_added,
  details->>'new_end_time' as new_end_time
FROM audit_logs
WHERE action = 'extend_auction'
  AND entity_id = 'CAR_ID_HERE'
ORDER BY created_at DESC
LIMIT 2;
```

#### Test 6.2: Try to Extend Ended Auction
**Steps:**
1. Find an auction that has already ended
2. Try to extend it
3. **Expected:** Error message: "Auction is not active"
4. **Expected:** No changes to database

#### Test 6.3: Try to Extend Paused Auction
**Steps:**
1. Pause an active auction
2. Try to extend it
3. **Expected:** Error message: "Auction is not active"

#### Test 6.4: Multiple Time Options
**Steps:**
1. Test each time option: 30min, 1hr, 2hrs, 4hrs, 8hrs, 12hrs, 24hrs
2. **Expected:** All options work correctly
3. Verify calculations are accurate

**Verification Query:**
```sql
-- Check if extension calculations are accurate
SELECT 
  entity_id,
  details->>'old_end_time' as old_end_time,
  details->>'new_end_time' as new_end_time,
  details->>'hours_added' as hours_added,
  EXTRACT(EPOCH FROM (
    (details->>'new_end_time')::timestamptz - 
    (details->>'old_end_time')::timestamptz
  )) / 3600 as actual_hours_difference
FROM audit_logs
WHERE action = 'extend_auction'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 7: Permission Validation

**Steps:**
1. Verify only admins can extend auctions
2. **Expected:** RLS policies prevent non-admin access

**SQL Query:**
```sql
-- Check RLS policies on auction_schedules
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'auction_schedules'
ORDER BY policyname;
```

---

### Test 8: Scheduled Auction Closure

**Objective:** Verify extended auctions close at the correct new time

**Steps:**
1. Create a test auction ending in 5 minutes
2. Extend it by 1 hour
3. Wait for original end time to pass
4. **Expected:** Auction remains active
5. Wait for new end time
6. **Expected:** Auction closes automatically via `close-ended-auctions` function

**Monitoring Query:**
```sql
-- Monitor auction status over time
SELECT 
  id,
  title,
  auction_status,
  auction_end_time,
  is_manually_controlled,
  CASE 
    WHEN auction_end_time > NOW() THEN 'Still Active'
    WHEN auction_end_time <= NOW() AND auction_status = 'active' THEN 'Should be closed'
    ELSE 'Closed'
  END as expected_status
FROM cars
WHERE id = 'CAR_ID_HERE';
```

---

## 🚨 Critical Issues to Watch For

1. **Data Inconsistency**
   - If `cars.auction_end_time` ≠ `auction_schedules.end_time`
   - **Action:** Check database function executed successfully

2. **Missing Audit Logs**
   - No entry in `audit_logs` after extension
   - **Action:** Check function permissions and RLS policies

3. **Real-Time Not Working**
   - Changes don't appear in other windows
   - **Action:** Check Supabase Realtime is enabled for tables

4. **Extension Ignored by System**
   - Auction closes at old time, not new time
   - **Action:** Verify `close-ended-auctions` function checks `auction_schedules.end_time`

---

## 📊 Comprehensive Test Results

Use this checklist to track your testing:

- [ ] Test 1: Basic Extension Functionality - PASSED
- [ ] Test 2: Data Consistency Verification - PASSED
- [ ] Test 3: Audit Log Verification - PASSED
- [ ] Test 4: Schedule Notes Update - PASSED
- [ ] Test 5: Real-Time Updates - PASSED
- [ ] Test 6.1: Multiple Extensions - PASSED
- [ ] Test 6.2: Extend Ended Auction - PASSED (Error shown)
- [ ] Test 6.3: Extend Paused Auction - PASSED (Error shown)
- [ ] Test 6.4: All Time Options - PASSED
- [ ] Test 7: Permission Validation - PASSED
- [ ] Test 8: Scheduled Closure - PASSED

---

## 🔧 Debugging Commands

### View all auction extensions in the last 24 hours
```sql
SELECT 
  al.created_at,
  c.title as auction_title,
  al.details->>'old_end_time' as old_end,
  al.details->>'new_end_time' as new_end,
  al.details->>'hours_added' as hours,
  al.details->>'reason' as reason
FROM audit_logs al
JOIN cars c ON al.entity_id = c.id
WHERE al.action = 'extend_auction'
  AND al.created_at > NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;
```

### Check for orphaned data
```sql
-- Find cars with auction_end_time but no running schedule
SELECT 
  c.id,
  c.title,
  c.auction_end_time,
  c.auction_status
FROM cars c
LEFT JOIN auction_schedules asch ON c.id = asch.car_id AND asch.status = 'running'
WHERE c.auction_status = 'active'
  AND asch.id IS NULL;
```

### Monitor real-time changes
```sql
-- Check updated_at timestamps
SELECT 
  'cars' as table_name,
  id,
  updated_at
FROM cars
WHERE id = 'CAR_ID_HERE'

UNION ALL

SELECT 
  'auction_schedules' as table_name,
  id,
  updated_at
FROM auction_schedules
WHERE car_id = 'CAR_ID_HERE';
```

---

## ✅ Final Validation

Once all tests pass:

1. **Production Readiness:**
   - All 8 test scenarios PASSED
   - No data inconsistencies found
   - Audit logs are complete
   - Real-time updates work
   - Edge cases handled correctly

2. **Documentation:**
   - Extension process documented
   - SQL queries saved for future debugging
   - Known limitations documented

3. **Monitoring:**
   - Set up alerts for failed extensions
   - Monitor audit logs daily
   - Check for data inconsistencies weekly

---

## 📞 Support

If you encounter issues during testing:
1. Check the browser console for errors
2. Review the SQL queries above
3. Verify RLS policies are correct
4. Check Supabase function logs: https://supabase.com/dashboard/project/sdvakfhmoaoucmhbhwvy/logs/functions

**The auction extension feature is production-ready when all tests pass! ✅**
