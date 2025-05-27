
export async function resolveUserId(
  isGuest: boolean, 
  userId: string | null, 
  req: Request, 
  supabaseService: any
): Promise<string | null> {
  let actualUserId = userId;
  
  if (!isGuest && !actualUserId) {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const { data: { user }, error } = await supabaseService.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (!error && user) {
          actualUserId = user.id;
          console.log('Retrieved user ID from auth token:', actualUserId);
        }
      } catch (authError) {
        console.error('Error getting user from auth token:', authError);
      }
    }
  }

  console.log('Final User ID:', actualUserId);
  return actualUserId;
}
