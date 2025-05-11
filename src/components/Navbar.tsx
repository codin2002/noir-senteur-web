import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Heart, ShoppingCart, History, User } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';
import CartBadge from '@/components/ui/cart-badge';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { count: cartCount } = useCartCount(user?.id);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    
    // If we're on the home page, scroll to the section
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're not on the home page, navigate to home and add the fragment
      navigate(`/#${id}`);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12',
        isScrolled ? 'py-2 bg-darker bg-opacity-95 backdrop-blur-sm' : 'py-4 bg-transparent'
      )}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="text-2xl md:text-3xl font-serif tracking-wider text-white">
          SENTEUR<span className="gold-text">.</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <button 
            onClick={() => scrollToSection('collection')} 
            className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
          >
            Collection
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
          >
            Contact
          </button>
          
          {/* Wishlist and Cart Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="text-white hover:text-gold transition-colors relative">
              <Heart className="h-5 w-5" />
            </Link>
            
            <Link to="/cart" className="text-white hover:text-gold transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <CartBadge count={cartCount} />
            </Link>
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer border border-gold/20">
                  <AvatarImage src={user.user_metadata.avatar_url || undefined} />
                  <AvatarFallback className="bg-gold/20 text-white">
                    {getInitials(user.user_metadata.full_name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-darker text-white border-gold/20">
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="focus:bg-gold/10 focus:text-white cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="focus:bg-gold/10 focus:text-white cursor-pointer"
                    onClick={() => navigate('/profile?tab=history')}
                  >
                    <History className="mr-2 h-4 w-4" />
                    <span>Purchase History</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gold/20" />
                <DropdownMenuItem 
                  className="focus:bg-gold/10 focus:text-white cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleSignIn}
              className="border-gold text-gold hover:bg-gold hover:text-darker"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <Link to="/wishlist" className="text-white hover:text-gold transition-colors">
            <Heart className="h-5 w-5" />
          </Link>
          
          <Link to="/cart" className="text-white hover:text-gold transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            <CartBadge count={cartCount} className="-top-1 -right-1" />
          </Link>
          
          <button 
            className="text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-darker bg-opacity-95 backdrop-blur-sm py-4">
          <div className="flex flex-col space-y-4 px-6">
            <button
              onClick={() => scrollToSection('collection')}
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
            >
              Collection
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
            >
              Contact
            </button>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-gold text-gold hover:bg-gold hover:text-darker"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="border-gold text-gold hover:bg-gold hover:text-darker"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
