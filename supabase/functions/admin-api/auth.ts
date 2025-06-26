
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header');
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Received token:', token ? `${token.substring(0, 10)}...` : 'null');

  // Create client with the user's token for authentication
  const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: {
      headers: {
        'Authorization': authHeader
      }
    }
  });

  // Verify the user is authenticated and is an admin
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !user) {
    console.error('Authentication failed:', userError);
    throw new Error('Authentication failed');
  }

  console.log('User authenticated:', user.id);

  // Check if user is admin using the authenticated client
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    console.error('Admin check failed:', profileError, profile);
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
