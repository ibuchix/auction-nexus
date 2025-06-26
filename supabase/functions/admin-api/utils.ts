
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function parseRequestBody(req: Request): Promise<{ action: string; params?: Record<string, any> }> {
  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Content-Type:', req.headers.get('content-type'));
    
    // Use req.json() directly instead of req.text() + JSON.parse()
    // This properly handles the JSON body sent by supabase.functions.invoke()
    const requestBody = await req.json();
    console.log('Parsed request body:', requestBody);

    const { action, params } = requestBody;
    if (!action) {
      throw new Error('Missing action parameter');
    }

    return { action, params };
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    console.error('Error details:', {
      name: parseError.name,
      message: parseError.message,
      stack: parseError.stack
    });
    throw parseError;
  }
}

export function createErrorResponse(error: string, status = 400, details?: string) {
  console.log('Creating error response:', { error, status, details });
  return new Response(
    JSON.stringify({ 
      error,
      ...(details && { details })
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createSuccessResponse(data: any) {
  console.log('Creating success response with data length:', Array.isArray(data) ? data.length : 'N/A');
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
