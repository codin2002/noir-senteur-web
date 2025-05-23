
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Perfume } from '@/types/perfume';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: Perfume;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export const useProfile = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProfile();
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Get orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      // For each order, get its items
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              perfume:perfumes(*)
            `)
            .eq('order_id', order.id);
            
          if (itemsError) throw itemsError;
          
          // Process items to match OrderItem type
          const processedItems: OrderItem[] = (itemsData || []).map(item => ({
            ...item,
            perfume: item.perfume as unknown as Perfume
          }));
          
          return {
            ...order,
            items: processedItems
          } as Order;
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase history', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      // Ensure data is properly typed as Profile
      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        address: data.address
      };
      
      setProfile(profileData);
      setFormData(prev => ({
        ...prev,
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      }));
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data', {
        description: error.message
      });
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: error.message
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [field]: e.target.value});
  };

  return {
    user,
    orders,
    profile,
    isLoading,
    formData,
    updateProfile,
    formatDate,
    handleSignOut,
    handleChange
  };
};
