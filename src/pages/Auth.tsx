import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FcGoogle } from 'react-icons/fc';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/hooks/useCheckout';

// Define validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface GuestDetails {
  name: string;
  email: string;
  phoneNumber: string;
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

const Auth = () => {
  const { user, isLoading, signIn, signUp, signInWithGoogle, forgotPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const { processPayment, isLoading: checkoutLoading } = useCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came here for checkout
  const isCheckoutFlow = location.state?.isCheckout;
  const cartItems = location.state?.cartItems || [];
  
  // Get the path to return to after successful login
  const from = location.state?.from || '/';
  
  // If user is already logged in, redirect to requested page or home page
  useEffect(() => {
    if (user && !isLoading) {
      // Check if there's a cart in localStorage to determine redirect
      const hasCart = localStorage.getItem('cartItems');
      const redirectPath = hasCart ? '/cart' : from;
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phoneNumber: '',
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleInputChange = (field: keyof GuestDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestDetails(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleGuestCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the guest address for payment processing
    const addressParts = [
      guestDetails.buildingName,
      guestDetails.floorNumber,
      guestDetails.roomNumber,
      guestDetails.area,
      guestDetails.landmark,
      guestDetails.emirate
    ].filter(Boolean);
    
    const guestAddress = `${addressParts.join(', ')} | Contact: ${guestDetails.name} | Email: ${guestDetails.email} | Phone: ${guestDetails.phoneNumber}`;
    
    await processPayment(cartItems, guestAddress);
  };

  const isGuestFormValid = () => {
    return guestDetails.name.trim() && 
           guestDetails.email.trim() && 
           guestDetails.phoneNumber.trim() &&
           guestDetails.buildingName.trim() &&
           guestDetails.area.trim() &&
           guestDetails.emirate.trim();
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      // Navigation will happen automatically in useEffect when user state changes
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      setActiveTab('login');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data.email);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Render checkout flow interface
  if (isCheckoutFlow) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <h1 className="text-3xl font-serif text-center mb-8">
              SENTEUR<span className="gold-text">.</span>
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Guest Checkout Box */}
              <div className="bg-darker p-8 rounded-lg shadow-xl border border-gold/20">
                <div className="text-center border-b border-gold/20 pb-4 mb-6">
                  <h3 className="text-xl font-serif text-gold mb-2">Checkout as Guest</h3>
                  <p className="text-sm text-white/70">Complete your order without creating an account</p>
                </div>

                <form onSubmit={handleGuestCheckout} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-white">Personal Information</h4>
                      
                      <div>
                        <Label htmlFor="guest_name" className="text-sm">Full Name *</Label>
                        <Input
                          id="guest_name"
                          value={guestDetails.name}
                          onChange={handleInputChange('name')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_email" className="text-sm">Email Address *</Label>
                        <Input
                          id="guest_email"
                          type="email"
                          value={guestDetails.email}
                          onChange={handleInputChange('email')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_phone" className="text-sm">Phone Number *</Label>
                        <Input
                          id="guest_phone"
                          value={guestDetails.phoneNumber}
                          onChange={handleInputChange('phoneNumber')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="+971 50 XXX XXXX"
                          required
                        />
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-white">Delivery Address</h4>
                      
                      <div>
                        <Label htmlFor="guest_building" className="text-sm">Building Name *</Label>
                        <Input
                          id="guest_building"
                          value={guestDetails.buildingName}
                          onChange={handleInputChange('buildingName')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., La vista 1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_floor" className="text-sm">Floor Number</Label>
                        <Input
                          id="guest_floor"
                          value={guestDetails.floorNumber}
                          onChange={handleInputChange('floorNumber')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., 6"
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_room" className="text-sm">Room/Office Number</Label>
                        <Input
                          id="guest_room"
                          value={guestDetails.roomNumber}
                          onChange={handleInputChange('roomNumber')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., 911"
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_area" className="text-sm">Area/Locality *</Label>
                        <Input
                          id="guest_area"
                          value={guestDetails.area}
                          onChange={handleInputChange('area')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., Nad Hessa"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_landmark" className="text-sm">Landmark (Optional)</Label>
                        <Input
                          id="guest_landmark"
                          value={guestDetails.landmark}
                          onChange={handleInputChange('landmark')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., Near SIT"
                        />
                      </div>

                      <div>
                        <Label htmlFor="guest_emirate" className="text-sm">Emirate *</Label>
                        <Input
                          id="guest_emirate"
                          value={guestDetails.emirate}
                          onChange={handleInputChange('emirate')}
                          className="border-gold/30 focus:border-gold"
                          placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isGuestFormValid() || checkoutLoading}
                    className="w-full bg-gold text-darker hover:bg-gold/80 mt-6"
                  >
                    {checkoutLoading ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </form>
              </div>

              {/* Sign In with Google Box */}
              <div className="bg-darker p-8 rounded-lg shadow-xl border border-gold/20 flex flex-col justify-center">
                <div className="text-center border-b border-gold/20 pb-4 mb-8">
                  <h3 className="text-xl font-serif text-gold mb-2">Sign In with Google</h3>
                  <p className="text-sm text-white/70">Continue with your Google account for faster checkout</p>
                </div>

                <div className="space-y-6">
                  <Button 
                    type="button" 
                    onClick={signInWithGoogle}
                    className="w-full bg-white text-black hover:bg-gray-100 h-12 text-lg"
                    disabled={isLoading}
                  >
                    <FcGoogle className="mr-3 h-6 w-6" />
                    Continue with Google
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-white/60">
                      By continuing, you agree to our terms of service and privacy policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular auth interface (non-checkout)
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-darker p-8 rounded-lg shadow-xl border border-gold/20">
          <h1 className="text-3xl font-serif text-center mb-6">
            SENTEUR<span className="gold-text">.</span>
          </h1>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6 bg-darker border border-gold/20">
              <TabsTrigger value="login" className="data-[state=active]:text-gold">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:text-gold">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="forgot" className="data-[state=active]:text-gold">
                Forgot
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Email" 
                            className="bg-background border-gold/20 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            className="bg-background border-gold/20 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gold text-darker hover:bg-gold/80"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gold/20 -translate-y-1/2"></div>
                <span className="relative bg-darker px-4 text-sm text-muted-foreground z-10">
                  or
                </span>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={signInWithGoogle}
                  className="w-full border-gold/20 text-white hover:bg-gold/10"
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Sign in with Google
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Full Name" 
                            className="bg-background border-gold/20 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Email" 
                            className="bg-background border-gold/20 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            className="bg-background border-gold/20 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gold text-darker hover:bg-gold/80"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gold/20 -translate-y-1/2"></div>
                <span className="relative bg-darker px-4 text-sm text-muted-foreground z-10">
                  or
                </span>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={signInWithGoogle}
                  className="w-full border-gold/20 text-white hover:bg-gold/10"
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Sign up with Google
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="forgot">
              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Email" 
                            className="bg-background border-gold/20 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gold text-darker hover:bg-gold/80"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Reset Password'}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center">
                <Button 
                  variant="link" 
                  className="text-gold p-0"
                  onClick={() => setActiveTab('login')}
                >
                  Back to Sign In
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
