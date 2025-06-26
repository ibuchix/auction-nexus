
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateAndAuthorize } from './auth.ts';
import { handleAdminAction } from './handlers.ts';
import { parseRequestBody, corsHeaders, createErrorResponse, createSuccessResponse } from './utils.ts';
import { AdminAction } from './types.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { action, params } = await parseRequestBody(req);

    // Authenticate and authorize user
    const { user, adminSupabase } = await authenticateAndAuthorize(req);

    // Handle the admin action
    const result = await handleAdminAction(action as AdminAction, params, adminSupabase, user);

    console.log('Admin API operation completed successfully:', action);
    return createSuccessResponse(result);

  } catch (error) {
    console.error('Admin API error:', error);
    
    // Handle specific error types
    if (error.message === 'Empty request body') {
      return createErrorResponse('Empty request body', 400);
    }
    
    if (error.message === 'Missing action parameter') {
      return createErrorResponse('Missing action parameter', 400);
    }
    
    if (error.message === 'Missing authorization header') {
      return createErrorResponse('Missing authorization header', 401);
    }
    
    if (error.message === 'Authentication failed') {
      return createErrorResponse('Authentication failed', 401);
    }
    
    if (error.message === 'Admin access required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    if (error.message === 'Unknown action') {
      return createErrorResponse('Unknown action', 400);
    }
    
    if (error.name === 'SyntaxError') {
      return createErrorResponse('Invalid JSON in request body', 400, error.message);
    }
    
    // Generic server error
    return createErrorResponse('Internal server error', 500, error.message);
  }
});
