
export interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export async function extractCustomerInfo(
  isGuest: boolean, 
  actualUserId: string | null, 
  deliveryAddress: string, 
  supabaseService: any
): Promise<CustomerInfo> {
  const addressParts = deliveryAddress.split('|');
  const addressValue = (prefix: string) =>
    addressParts
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix))
      ?.slice(prefix.length)
      .trim() || '';

  const checkoutName = addressValue('Contact:');
  const checkoutEmail = addressValue('Email:');
  const checkoutPhone = addressValue('Phone:');
  let customerName = checkoutName || 'Guest Customer';
  let customerEmail = checkoutEmail || 'guest@example.com';
  let customerPhone = checkoutPhone || 'Not provided';

  if (!isGuest && actualUserId) {
    // Get user profile for authenticated users
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('full_name, phone')
      .eq('id', actualUserId)
      .single();

    if (!profileError && profile) {
      customerName = checkoutName || profile.full_name || 'User';
      customerPhone = checkoutPhone || profile.phone || 'Not provided';
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseService.auth.admin.getUserById(actualUserId);
    if (!userError && user) {
      customerEmail = checkoutEmail || user.email || 'user@example.com';
    }
  }

  console.log('Extracted customer details:', { customerName, customerEmail, customerPhone });
  return { customerName, customerEmail, customerPhone };
}
