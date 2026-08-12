export type ProductAudience = 'Men' | 'Women' | 'Unisex';

export interface AdminOrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: { name: string; price: string };
  audience?: ProductAudience;
}

export interface AdminOrder {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  fulfillment_status: 'new' | 'packed' | 'shipped' | 'delivered';
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  items: AdminOrderItem[];
}
