
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, History, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    id: string;
    name: string;
    notes: string;
    image: string;
  };
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });
  const { user, signOut } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Profile | Senteur Fragrances";
    
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
          
          return {
            ...order,
            items: itemsData || []
          };
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
      
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        full_name: data?.full_name || '',
        avatar_url: data?.avatar_url || ''
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
          avatar_url: formData.avatar_url
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

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <User className="h-12 w-12 mx-auto mb-4 text-gold opacity-70" />
            <h2 className="text-2xl font-serif mb-4">Sign in to access your profile</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your profile, purchase history, and account details.
            </p>
            <Button 
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-darker"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">My Profile</h1>
            <div className="w-24 h-0.5 bg-gold mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="history" className="data-[state=active]:bg-gold data-[state=active]:text-darker">
                  <History className="h-4 w-4 mr-2" />
                  Purchase History
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-gold data-[state=active]:text-darker">
                  <User className="h-4 w-4 mr-2" />
                  Account Details
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-0">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-darker border border-gold/20 rounded-lg">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
                    <h2 className="text-xl mb-2">No purchase history</h2>
                    <p className="text-muted-foreground mb-6">You haven't made any purchases yet.</p>
                    <Button 
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-darker"
                      onClick={() => navigate('/')}
                    >
                      Browse Collection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gold/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground">Order #{order.id.substring(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-gold text-lg">Total: ${order.total}</p>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-sm font-medium mb-3">Items</h3>
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded overflow-hidden">
                                  <img 
                                    src={item.perfume.image} 
                                    alt={item.perfume.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-serif">{item.perfume.name}</h4>
                                  <p className="text-sm text-muted-foreground">{item.perfume.notes}</p>
                                </div>
                                <div className="text-right">
                                  <p>${item.price} × {item.quantity}</p>
                                  <p className="text-gold">${item.price * item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="account">
                <div className="bg-darker border border-gold/20 rounded-lg p-6">
                  <div className="max-w-xl mx-auto">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          value={formData.email}
                          disabled
                          className="bg-darker border-gold/30 text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input 
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          className="bg-darker border-gold/30"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Profile Picture URL</Label>
                        <Input 
                          id="avatar_url"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                          className="bg-darker border-gold/30"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      
                      <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between">
                        <Button 
                          variant="outline" 
                          className="border-red-500/50 hover:bg-red-500/10 text-red-400"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                        
                        <Button 
                          className="bg-gold text-darker hover:bg-gold/80"
                          onClick={updateProfile}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
