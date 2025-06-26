
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function parseRequestBody(req: Request): Promise<{ action: string; params?: Record<string, any> }> {
  try {
    const text = await req.text();
    console.log('Raw request body:', text ? `${text.substring(0, 100)}...` : 'empty');
    
    if (!text || text.trim() === '') {
      throw new Error('Empty request body');
    }

    const requestBody = JSON.parse(text);
    console.log('Parsed request body:', requestBody);

    const { action, params } = requestBody;
    if (!action) {
      throw new Error('Missing action parameter');
    }

    return { action, params };
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    throw parseError;
  }
}

export function createErrorResponse(error: string, status = 400, details?: string) {
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
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
