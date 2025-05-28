
interface UserInfo {
  email: string;
  name: string;
}

export async function getUserInfo(order: any, supabaseClient: any): Promise<UserInfo> {
  let recipientEmail = '';
  let recipientName = '';

  if (order.user_id) {
    // For authenticated users, get email from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(order.user_id);
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      throw new Error('Failed to fetch user details');
    }
    recipientEmail = user.email || '';
    recipientName = user.user_metadata?.full_name || 'Valued Customer';
  } else {
    // For guest orders
    recipientEmail = order.guest_email || '';
    recipientName = order.guest_name || 'Valued Customer';
  }

  if (!recipientEmail) {
    throw new Error('No recipient email found');
  }

  return {
    email: recipientEmail,
    name: recipientName
  };
}
