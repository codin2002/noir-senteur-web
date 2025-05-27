
export async function getCartItems(isGuest: boolean, cartItems: any[], actualUserId: string | null, supabaseService: any) {
  let orderCartItems = [];
  
  if (isGuest && cartItems) {
    console.log('=== STEP 3A: PROCESSING GUEST ORDER ===');
    orderCartItems = cartItems;
  } else if (!isGuest) {
    console.log('=== STEP 3B: PROCESSING AUTHENTICATED USER ORDER ===');
    
    if (!actualUserId) {
      throw new Error('User authentication required but no user ID found');
    }

    // Get cart items from database for authenticated user
    const { data: userCartItems, error: cartError } = await supabaseService
      .rpc('get_cart_with_perfumes', { user_uuid: actualUserId });

    if (cartError) {
      console.error('Error fetching user cart:', cartError);
      throw new Error('Failed to fetch user cart items');
    }

    if (!userCartItems || userCartItems.length === 0) {
      throw new Error('No cart items found for user');
    }

    orderCartItems = userCartItems;
    console.log('Found cart items for user:', orderCartItems.length);
  } else {
    throw new Error('Invalid request: either guest checkout with cart items or authenticated user required');
  }

  return orderCartItems;
}
