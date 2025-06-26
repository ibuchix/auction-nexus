
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function authenticateAndAuthorize(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 8) + '...' : 'missing'
  });
  
  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  console.log('Authorization header present:', !!authHeader);
  console.log('Authorization header format valid:', authHeader?.startsWith('Bearer '));
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header');
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted token length:', token.length);
  console.log('Token preview:', token.substring(0, 20) + '...');

  // Create client with the user's token for authentication
  const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: {
      headers: {
        'Authorization': authHeader
      }
    }
  });

  console.log('Attempting to verify user with token...');
  
  // Verify the user is authenticated and is an admin
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    console.error('Authentication failed - error details:', {
      message: userError.message,
      status: userError.status,
      code: userError.code
    });
    throw new Error('Authentication failed');
  }
  
  if (!user) {
    console.error('Authentication failed - no user returned');
    throw new Error('Authentication failed');
  }

  console.log('User authenticated successfully:', {
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Check if user is admin using the authenticated client
  console.log('Checking admin privileges for user:', user.id);
  
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details
    });
    throw new Error('Admin access required');
  }
  
  if (!profile || profile.role !== 'admin') {
    console.error('Admin check failed:', {
      profileExists: !!profile,
      role: profile?.role
    });
    throw new Error('Admin access required');
  }

  console.log('Admin access verified for user:', user.id);

  // Create admin client with service role for database operations
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return { user, adminSupabase };
}
