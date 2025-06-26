
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function parseRequestBody(req: Request): Promise<{ action: string; params?: Record<string, any> }> {
  try {
    console.log('=== Request Body Parsing Debug ===');
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.headers.get('content-type'));
    console.log('Content-Length:', req.headers.get('content-length'));
    
    // Check if request has a body
    const contentLength = req.headers.get('content-length');
    const hasBody = contentLength && parseInt(contentLength) > 0;
    
    console.log('Has body:', hasBody);
    console.log('Body used:', req.bodyUsed);
    
    let requestBody: any = null;
    
    if (hasBody && !req.bodyUsed) {
      try {
        // First try to get the body as text to see what we're working with
        const bodyText = await req.text();
        console.log('Raw body text:', bodyText);
        console.log('Body text length:', bodyText.length);
        
        if (bodyText.length > 0) {
          // Try to parse as JSON
          requestBody = JSON.parse(bodyText);
          console.log('Successfully parsed JSON body:', requestBody);
        } else {
          console.log('Empty body text received');
          requestBody = {};
        }
      } catch (parseError) {
        console.error('Error parsing body as JSON:', parseError);
        // If JSON parsing fails, try to handle as form data or other formats
        requestBody = {};
      }
    } else {
      console.log('No body content detected or body already used');
      requestBody = {};
    }

    // Extract action and params
    const { action, params } = requestBody || {};
    
    console.log('Extracted action:', action);
    console.log('Extracted params:', params);
    
    if (!action) {
      console.error('No action found in request body');
      throw new Error('Missing action parameter');
    }

    console.log('=== Request Body Parsing Complete ===');
    return { action, params };
    
  } catch (error) {
    console.error('=== Request Body Parsing Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Invalid JSON format in request body');
    }
    
    if (error.message === 'Missing action parameter') {
      throw error; // Re-throw as is
    }
    
    throw new Error(`Request parsing failed: ${error.message}`);
  }
}

export function createErrorResponse(error: string, status = 400, details?: string) {
  console.log('=== Creating Error Response ===');
  console.log('Error:', error);
  console.log('Status:', status);
  console.log('Details:', details);
  
  const errorResponse = {
    error,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
  
  console.log('Error response object:', errorResponse);
  
  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createSuccessResponse(data: any) {
  console.log('=== Creating Success Response ===');
  console.log('Data type:', typeof data);
  console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
  
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify(response),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
