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
import { OFFERS, getCartSubtotal, getSignatureDuoSavings } from '@/utils/constants';

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
  area: string;
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
  const offerId = location.state?.offerId as string | undefined;
  const isSignatureDuo = offerId === OFFERS.SIGNATURE_DUO.ID;
  const checkoutTotal = getCartSubtotal(cartItems);
  const duoSavings = getSignatureDuoSavings(cartItems);
  
  // Get the path to return to after successful login
  const from = location.state?.from || '/';
  
  // If user is already logged in, redirect to requested page or home page
  useEffect(() => {
    if (user && !isLoading && !isCheckoutFlow) {
      // Check if there's a cart in localStorage to determine redirect
      const hasCart = localStorage.getItem('cartItems');
      const redirectPath = hasCart ? '/cart' : from;
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, isCheckoutFlow, navigate, from]);

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phoneNumber: '',
    buildingName: '',
    area: '',
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
      guestDetails.area,
      guestDetails.emirate
    ].filter(Boolean);
    
    const guestAddress = `${addressParts.join(', ')} | Contact: ${guestDetails.name} | Email: ${guestDetails.email} | Phone: ${guestDetails.phoneNumber}`;
    
    await processPayment(cartItems, guestAddress, {
      preserveCart: Boolean(location.state?.preserveCart),
      offerId,
    });
  };

  const isGuestFormValid = () => {
    return guestDetails.name.trim() && 
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
            
          <div className="max-w-2xl mx-auto">
            <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-gold/20 bg-darker/70 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl text-gold">Your order</h2>
                  {isSignatureDuo && <p className="text-xs text-white/55">The Senteur Signature Duo</p>}
                </div>
                <span className="text-gold font-semibold">AED {checkoutTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-3">
                {cartItems.map((item: any) => (
                  <div key={item.id ?? item.perfume?.id} className="flex items-center gap-3 text-left">
                    {item.perfume?.image && <img src={item.perfume.image} alt={item.perfume.name} className="h-12 w-12 rounded object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{item.perfume?.name}</p>
                      <p className="text-xs text-white/60">100 ml · Quantity: {item.quantity || 1}</p>
                    </div>
                    <span className="text-sm text-gold">AED {(Number(item.perfume?.price_value || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
                {duoSavings > 0 && (
                  <div className="flex items-center justify-between border-t border-gold/15 pt-3 text-sm">
                    <span className="text-green-300">Bundle savings</span>
                    <span className="font-medium text-green-300">- AED {duoSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              {/* Guest Checkout Box */}
              <div className="group flex">
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
                            <Label htmlFor="guest_email" className="text-sm text-white/80 mb-2 block">Email Address (optional)</Label>
                            <Input
                              id="guest_email"
                              type="email"
                              value={guestDetails.email}
                              onChange={handleInputChange('email')}
                              className="bg-white/5 border-white/10 focus:border-gold/50 focus:bg-white/10 text-white placeholder:text-white/40 h-12 rounded-lg transition-all duration-300"
                              placeholder="your.email@example.com"
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
                        
                        <div className="grid grid-cols-1 gap-4">
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
                          `Pay AED ${checkoutTotal.toFixed(2)} securely`
                        )}
                      </Button>
                    </div>

                    {/* OR Divider - Inside Guest Checkout */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gold/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-darker px-3 text-muted-foreground font-medium">or</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="mb-3 text-sm text-white/50">Already have an account?</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={signInWithGoogle}
                        className="w-full border-gold/30 text-white hover:bg-gold/10 h-12"
                        disabled={isLoading}
                      >
                        <FcGoogle className="mr-2 h-5 w-5" />
                        Continue with Google
                      </Button>
                    </div>
                  </form>
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
