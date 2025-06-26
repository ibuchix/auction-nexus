
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateAndAuthorize } from './auth.ts';
import { handleAdminAction } from './handlers.ts';
import { parseRequestBody, corsHeaders, createErrorResponse, createSuccessResponse } from './utils.ts';
import { AdminAction } from './types.ts';

serve(async (req) => {
  console.log('=== Admin API Request Started ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());
  
  // Log all headers for debugging
  const headers = Object.fromEntries(req.headers.entries());
  console.log('Request headers:', headers);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('=== Handling CORS Preflight ===');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only allow POST requests for actual operations
  if (req.method !== 'POST') {
    console.error('Invalid request method:', req.method);
    return createErrorResponse('Only POST requests are allowed', 405);
  }

  try {
    console.log('=== Step 1: Request Body Parsing ===');
    
    // Parse request body with improved error handling
    const { action, params } = await parseRequestBody(req);
    
    console.log('=== Step 2: Authentication and Authorization ===');
    const { user, adminSupabase } = await authenticateAndAuthorize(req);
    console.log('Authentication successful for user:', user.id);

    console.log('=== Step 3: Handling Admin Action ===');
    console.log('Processing action:', action);
    console.log('With parameters:', params);
    
    const result = await handleAdminAction(action as AdminAction, params, adminSupabase, user);
    console.log('Admin action completed successfully:', action);

    console.log('=== Step 4: Returning Success Response ===');
    return createSuccessResponse(result);

  } catch (error) {
    console.error('=== Admin API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types with more detailed responses
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request format', 400, 'Request body must be valid JSON');
    }
    
    if (error.message === 'Missing action parameter') {
      return createErrorResponse('Missing required action parameter', 400, 'Request must include an action field');
    }
    
    if (error.message === 'Missing authorization header') {
      return createErrorResponse('Authentication required', 401, 'Authorization header with valid token required');
    }
    
    if (error.message === 'Authentication failed') {
      return createErrorResponse('Invalid authentication', 401, 'Token validation failed');
    }
    
    if (error.message === 'Admin access required') {
      return createErrorResponse('Insufficient permissions', 403, 'Admin role required for this operation');
    }
    
    if (error.message === 'Unknown action') {
      return createErrorResponse('Invalid action', 400, `Action '${error.action || 'unknown'}' not supported`);
    }
    
    // Generic server error with sanitized message
    console.error('Unhandled error in admin API');
    return createErrorResponse(
      'Internal server error', 
      500, 
      process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    );
  }
});
