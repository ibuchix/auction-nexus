

# Fix Auth in Edge Functions

## Problem
Both `send-whatsapp` and `get-dealers-with-phones` use `supabase.auth.getClaims(token)`, which **does not exist** in `@supabase/supabase-js@2.38.4`. The working `admin-api` function uses `supabase.auth.getUser(token)` — confirming this is the correct method for this SDK version.

These functions were newly created and had never successfully processed a request — the `getClaims` call silently returns an error, causing the 401 response.

## Evidence
- `admin-api/index.ts` (line 68): uses `getUser(token)` — works
- `send-whatsapp/index.ts` (line 43): uses `getClaims(token)` — returns 401
- `get-dealers-with-phones/index.ts` (line 33): uses `getClaims(token)` — returns 401
- Direct curl test confirmed both return `{"error":"Unauthorized"}`

## Fix (2 files)

### 1. `supabase/functions/send-whatsapp/index.ts`
Replace lines 42-49:
```typescript
const token = authHeader.replace("Bearer ", "");
const { data: { user }, error: userError } = await supabase.auth.getUser(token);
if (userError || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
const userId = user.id;
```

### 2. `supabase/functions/get-dealers-with-phones/index.ts`
Replace lines 32-40 with the same pattern.

### 3. Deploy and test both functions

No other changes needed. The rest of the logic (admin role check, Twilio call, DB logging, UI) is correct.

