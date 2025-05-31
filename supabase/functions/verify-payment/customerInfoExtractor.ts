
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
  let customerName = 'Guest Customer';
  let customerEmail = 'guest@example.com';
  let customerPhone = 'Not provided';

  if (!isGuest && actualUserId) {
    // Get user profile for authenticated users
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('full_name, phone')
      .eq('id', actualUserId)
      .single();

    if (!profileError && profile) {
      customerName = profile.full_name || 'User';
      customerPhone = profile.phone || 'Not provided';
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseService.auth.admin.getUserById(actualUserId);
    if (!userError && user) {
      customerEmail = user.email || 'user@example.com';
    }
  } else {
    // For guest orders, extract from the structured delivery address
    const addressParts = deliveryAddress.split('|');
    for (const part of addressParts) {
      const trimmedPart = part.trim();
      if (trimmedPart.startsWith('Contact:')) {
        customerName = trimmedPart.replace('Contact:', '').trim();
      } else if (trimmedPart.startsWith('Email:')) {
        customerEmail = trimmedPart.replace('Email:', '').trim();
      } else if (trimmedPart.startsWith('Phone:')) {
        customerPhone = trimmedPart.replace('Phone:', '').trim();
      }
    }
  }

  console.log('Extracted customer details:', { customerName, customerEmail, customerPhone });
  return { customerName, customerEmail, customerPhone };
}
