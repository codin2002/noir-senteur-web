
import { Perfume } from '@/types/perfume';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: Perfume;
}

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}
