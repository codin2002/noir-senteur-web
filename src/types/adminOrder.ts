export interface AdminOrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: { name: string; price: string };
}

export interface AdminOrder {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  fulfillment_status: 'new' | 'packed' | 'shipped' | 'delivered';
  order_source: 'online' | 'manual';
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  traffic_source: 'meta_ads' | 'direct' | 'unknown';
  meta_click_id: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  items: AdminOrderItem[];
}
