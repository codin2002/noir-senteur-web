
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
      console.log('=== FETCHING ORDERS FOR USER ===');
      console.log('User ID:', user?.id);
      
      // Use the RPC function to get orders with items
      const { data: ordersData, error: ordersError } = await supabase.rpc('get_orders_with_items', {
        user_uuid: user?.id
      });
        
      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        throw ordersError;
      }
      
      console.log('Orders data received:', ordersData);
      
      // Filter to only show orders for the current user (extra safety)
      const userOrders = (ordersData || []).filter(order => order.user_id === user?.id);
      
      // Process the orders to match our Order type
      const processedOrders: Order[] = userOrders.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total,
        items: order.items || []
      }));
      
      console.log('Processed orders:', processedOrders);
      setOrders(processedOrders);
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
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }
      
      // If no profile exists, create one for Google users
      if (!data && user) {
        console.log('Creating profile for Google user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          console.log('Profile created:', newProfile);
          setProfile(newProfile);
          setFormData(prev => ({
            ...prev,
            full_name: newProfile.full_name || '',
            phone: newProfile.phone || '',
            address: newProfile.address || ''
          }));
        }
      } else if (data) {
        // Profile exists
        setProfile(data);
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
      }
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
