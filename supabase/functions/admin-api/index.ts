
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateAndAuthorize } from './auth.ts';
import { handleAdminAction } from './handlers.ts';
import { parseRequestBody, corsHeaders, createErrorResponse, createSuccessResponse } from './utils.ts';
import { AdminAction } from './types.ts';

serve(async (req) => {
  console.log('=== Admin API Request Started ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Step 1: Parsing request body ===');
    // Parse request body
    const { action, params } = await parseRequestBody(req);
    console.log('Successfully parsed request:', { action, params });

    console.log('=== Step 2: Authentication and authorization ===');
    // Authenticate and authorize user
    const { user, adminSupabase } = await authenticateAndAuthorize(req);
    console.log('Authentication successful for user:', user.id);

    console.log('=== Step 3: Handling admin action ===');
    // Handle the admin action
    const result = await handleAdminAction(action as AdminAction, params, adminSupabase, user);
    console.log('Admin action completed successfully:', action);

    console.log('=== Step 4: Returning success response ===');
    return createSuccessResponse(result);

  } catch (error) {
    console.error('=== Admin API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types with detailed logging
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      console.error('JSON parsing failed - request body was not valid JSON');
      return createErrorResponse('Invalid JSON in request body', 400, error.message);
    }
    
    if (error.message === 'Missing action parameter') {
      console.error('Request missing required action parameter');
      return createErrorResponse('Missing action parameter', 400);
    }
    
    if (error.message === 'Missing authorization header') {
      console.error('Authorization header missing from request');
      return createErrorResponse('Missing authorization header', 401);
    }
    
    if (error.message === 'Authentication failed') {
      console.error('User authentication failed');
      return createErrorResponse('Authentication failed', 401);
    }
    
    if (error.message === 'Admin access required') {
      console.error('User does not have admin privileges');
      return createErrorResponse('Admin access required', 403);
    }
    
    if (error.message === 'Unknown action') {
      console.error('Unknown action requested');
      return createErrorResponse('Unknown action', 400);
    }
    
    // Generic server error with more details
    console.error('Generic server error - returning 500');
    return createErrorResponse('Internal server error', 500, error.message);
  }
});
