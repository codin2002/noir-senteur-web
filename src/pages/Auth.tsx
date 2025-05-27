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
      <div className="min-h-screen bg-gradient-to-br from-dark via-darker to-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4 text-white">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Render checkout flow interface
  if (isCheckoutFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-darker to-dark text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              SENTEUR
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6"></div>
            <p className="text-white/70 text-lg">Complete your purchase</p>
          </div>
            
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative">
              {/* Guest Checkout Box */}
              <div className="group min-h-[600px] flex">
                <div className="bg-gradient-to-br from-darker/80 to-dark/60 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-2xl border border-gold/10 hover:border-gold/20 transition-all duration-500 hover:shadow-gold/5 hover:shadow-2xl w-full">
                  <div className="text-center pb-8 mb-8 border-b border-gold/20">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-gold rounded-full"></div>
                    </div>
                    <h3 className="text-2xl font-serif text-gold mb-3">Checkout as Guest</h3>
                    <p className="text-white/60 leading-relaxed">Complete your order quickly without creating an account</p>
                  </div>

                  <form onSubmit={handleGuestCheckout} className="space-y-6">
                    <div className="grid grid-cols-1 gap-8">
                      {/* Personal Details */}
                      <div className="space-y-5">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-2 h-2 bg-gold rounded-full"></div>
                          <h4 className="font-medium text-white text-lg">Personal Information</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="guest_name" className="text-sm text-white/80 mb-2 block">Full Name *</Label>
                            <Input
                              id="guest_name"
                              value={guestDetails.name}
                              onChange={handleInputChange('name')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_email" className="text-sm text-white/80 mb-2 block">Email Address *</Label>
                            <Input
                              id="guest_email"
                              type="email"
                              value={guestDetails.email}
                              onChange={handleInputChange('email')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_phone" className="text-sm text-white/80 mb-2 block">Phone Number *</Label>
                            <Input
                              id="guest_phone"
                              value={guestDetails.phoneNumber}
                              onChange={handleInputChange('phoneNumber')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="+971 50 XXX XXXX"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="space-y-5">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-2 h-2 bg-gold rounded-full"></div>
                          <h4 className="font-medium text-white text-lg">Delivery Address</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guest_building" className="text-sm text-white/80 mb-2 block">Building Name *</Label>
                            <Input
                              id="guest_building"
                              value={guestDetails.buildingName}
                              onChange={handleInputChange('buildingName')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., La vista 1"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_floor" className="text-sm text-white/80 mb-2 block">Floor Number</Label>
                            <Input
                              id="guest_floor"
                              value={guestDetails.floorNumber}
                              onChange={handleInputChange('floorNumber')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., 6"
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_room" className="text-sm text-white/80 mb-2 block">Room/Office Number</Label>
                            <Input
                              id="guest_room"
                              value={guestDetails.roomNumber}
                              onChange={handleInputChange('roomNumber')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., 911"
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_area" className="text-sm text-white/80 mb-2 block">Area/Locality *</Label>
                            <Input
                              id="guest_area"
                              value={guestDetails.area}
                              onChange={handleInputChange('area')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., Nad Hessa"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_landmark" className="text-sm text-white/80 mb-2 block">Landmark (Optional)</Label>
                            <Input
                              id="guest_landmark"
                              value={guestDetails.landmark}
                              onChange={handleInputChange('landmark')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., Near SIT"
                            />
                          </div>

                          <div>
                            <Label htmlFor="guest_emirate" className="text-sm text-white/80 mb-2 block">Emirate *</Label>
                            <Input
                              id="guest_emirate"
                              value={guestDetails.emirate}
                              onChange={handleInputChange('emirate')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        disabled={!isGuestFormValid() || checkoutLoading}
                        className="w-full bg-gradient-to-r from-gold to-gold-light text-dark hover:from-gold/90 hover:to-gold-light/90 h-14 text-lg font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
                      >
                        {checkoutLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Continue to Payment'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* OR Divider - Desktop */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-darker/95 to-dark/90 backdrop-blur-sm px-8 py-4 rounded-full border border-gold/30 shadow-2xl">
                  <span className="text-gold font-semibold text-xl">OR</span>
                </div>
              </div>

              {/* Sign In with Google Box */}
              <div className="group min-h-[600px] flex">
                <div className="bg-gradient-to-br from-darker/80 to-dark/60 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-2xl border border-gold/10 hover:border-gold/20 transition-all duration-500 hover:shadow-gold/5 hover:shadow-2xl h-full flex flex-col justify-center w-full">
                  <div className="text-center pb-8 mb-8 border-b border-gold/20">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FcGoogle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif text-gold mb-3">Sign In with Google</h3>
                    <p className="text-white/60 leading-relaxed">Continue with your Google account for faster checkout and order tracking</p>
                  </div>

                  <div className="space-y-8 flex-1 flex flex-col justify-center">
                    <div className="space-y-6">
                      <Button 
                        type="button" 
                        onClick={signInWithGoogle}
                        className="w-full bg-white text-dark hover:bg-gray-50 h-14 text-lg font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                        disabled={isLoading}
                      >
                        <FcGoogle className="mr-3 h-6 w-6" />
                        Continue with Google
                      </Button>

                      <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="w-8 h-px bg-gold/30"></div>
                          <span className="text-sm text-white/50">Benefits</span>
                          <div className="w-8 h-px bg-gold/30"></div>
                        </div>
                        
                        <div className="space-y-3 text-sm text-white/60">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-1 h-1 bg-gold rounded-full"></div>
                            <span>Faster checkout process</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-1 h-1 bg-gold rounded-full"></div>
                            <span>Order history & tracking</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-1 h-1 bg-gold rounded-full"></div>
                            <span>Personalized recommendations</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-6">
                      <p className="text-xs text-white/40 leading-relaxed">
                        By continuing, you agree to our terms of service and privacy policy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OR Divider - Mobile */}
            <div className="lg:hidden flex items-center justify-center my-8">
              <div className="flex items-center w-full max-w-md mx-auto">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/40"></div>
                <div className="px-6">
                  <div className="bg-gradient-to-br from-darker/95 to-dark/90 backdrop-blur-sm px-6 py-3 rounded-full border border-gold/30 shadow-xl">
                    <span className="text-gold font-semibold text-lg">OR</span>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/40"></div>
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
            SENTEUR
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
