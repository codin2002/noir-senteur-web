
interface DeliveryInfo {
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
}

interface OrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    name: string;
    price: string;
  };
}

interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  items: OrderItem[];
}

export const parseDeliveryInfo = (deliveryAddress: string): DeliveryInfo | null => {
  if (!deliveryAddress) return null;
  
  // Check for structured format with |
  if (deliveryAddress.includes('|')) {
    const parts = deliveryAddress.split('|');
    const info = {
      contactName: '',
      phone: '',
      email: '',
      address: ''
    };
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.startsWith('Contact:')) {
        info.contactName = trimmed.replace('Contact:', '').trim();
      } else if (trimmed.startsWith('Phone:')) {
        info.phone = trimmed.replace('Phone:', '').trim();
      } else if (trimmed.startsWith('Email:')) {
        info.email = trimmed.replace('Email:', '').trim();
      } else if (trimmed.startsWith('Address:')) {
        info.address = trimmed.replace('Address:', '').trim();
      }
    });
    
    return info;
  }
  
  // For legacy or simple addresses, clean up any repetition
  const cleanAddress = deliveryAddress
    .split(',')
    .map(part => part.trim())
    .filter((part, index, arr) => arr.indexOf(part) === index) // Remove duplicates
    .join(', ');
  
  return {
    contactName: '',
    phone: '',
    email: '',
    address: cleanAddress
  };
};

export const getCustomerInfo = (order: Order): CustomerInfo => {
  // If user_id exists, this is a registered user
  if (order.user_id) {
    // Check if guest info is available (might be filled for registered users too)
    if (order.guest_name || order.guest_email || order.guest_phone) {
      return {
        name: order.guest_name || 'Registered User',
        email: order.guest_email || 'Via user account',
        phone: order.guest_phone || 'Via user account',
        isGuest: false
      };
    }
    
    // Check parsed delivery info for registered users
    const deliveryInfo = parseDeliveryInfo(order.delivery_address || '');
    if (deliveryInfo && deliveryInfo.contactName) {
      return {
        name: deliveryInfo.contactName,
        email: deliveryInfo.email || 'Via user account',
        phone: deliveryInfo.phone || 'Via user account',
        isGuest: false
      };
    }
    
    // Default for registered users
    return {
      name: 'Registered User',
      email: 'Via user account',
      phone: 'Via user account',
      isGuest: false
    };
  }
  
  // Handle guest users (no user_id)
  if (order.guest_name || order.guest_email || order.guest_phone) {
    return {
      name: order.guest_name || 'No name provided',
      email: order.guest_email || 'No email provided',
      phone: order.guest_phone || 'No phone provided',
      isGuest: true
    };
  }
  
  // Check parsed delivery info for guests
  const deliveryInfo = parseDeliveryInfo(order.delivery_address || '');
  if (deliveryInfo && deliveryInfo.contactName) {
    return {
      name: deliveryInfo.contactName,
      email: deliveryInfo.email || 'No email provided',
      phone: deliveryInfo.phone || 'No phone provided',
      isGuest: true
    };
  }
  
  return {
    name: 'Unknown Customer',
    email: 'No email',
    phone: 'No phone',
    isGuest: true
  };
};

export const getDeliveryAddress = (order: Order): string => {
  const deliveryInfo = parseDeliveryInfo(order.delivery_address || '');
  
  if (deliveryInfo && deliveryInfo.address) {
    return deliveryInfo.address;
  }
  
  return order.delivery_address || 'Address on file';
};

export const getStatusBadgeClasses = (status: string): string => {
  switch (status) {
    case 'delivered':
      return 'bg-green-500/20 text-green-400';
    case 'dispatched':
      return 'bg-blue-500/20 text-blue-400';
    case 'returned':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-yellow-500/20 text-yellow-400';
  }
};
