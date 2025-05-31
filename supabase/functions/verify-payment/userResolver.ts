
export async function resolveUserId(
  isGuest: boolean, 
  userId: string | null, 
  req: Request, 
  supabaseService: any
): Promise<string | null> {
  let actualUserId = userId;
  
  console.log('=== USER ID RESOLUTION ===');
  console.log('Is Guest:', isGuest);
  console.log('User ID from request:', userId);
  
  if (!isGuest && !actualUserId) {
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseService.auth.getUser(token);
        
        if (!error && user) {
          actualUserId = user.id;
          console.log('Retrieved user ID from auth token:', actualUserId);
          console.log('User email:', user.email);
        } else {
          console.error('Error getting user from auth token:', error);
        }
      } catch (authError) {
        console.error('Exception getting user from auth token:', authError);
      }
    }
  }

  // Ensure we have a valid user ID for non-guest orders
  if (!isGuest && !actualUserId) {
    console.error('ERROR: Non-guest order but no user ID could be resolved');
    throw new Error('Unable to resolve user ID for authenticated order');
  }

  console.log('Final resolved User ID:', actualUserId);
  console.log('=== END USER ID RESOLUTION ===');
  
  return actualUserId;
}
