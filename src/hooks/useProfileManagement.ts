
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Profile, ProfileFormData } from '@/types/profile';

export const useProfileManagement = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [field]: e.target.value});
  };

  const initializeFormData = () => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  };

  return {
    profile,
    formData,
    fetchProfile,
    updateProfile,
    handleSignOut,
    handleChange,
    initializeFormData
  };
};
