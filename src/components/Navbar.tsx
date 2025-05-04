
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12',
        isScrolled ? 'py-2 bg-darker bg-opacity-95 backdrop-blur-sm' : 'py-4 bg-transparent'
      )}
    >
      <div className="flex items-center justify-between">
        <a href="/" className="text-2xl md:text-3xl font-serif tracking-wider text-white">
          SENTEUR<span className="gold-text">.</span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <a href="#collection" className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider">
            Collection
          </a>
          <a href="#about" className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider">
            Contact
          </a>
          
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
                  <DropdownMenuItem className="focus:bg-gold/10 focus:text-white">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gold/10 focus:text-white">
                    Account
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
        <button 
          className="md:hidden text-white"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-darker bg-opacity-95 backdrop-blur-sm py-4">
          <div className="flex flex-col space-y-4 px-6">
            <a 
              href="#collection" 
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collection
            </a>
            <a 
              href="#about" 
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-muted-foreground hover:text-gold transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            {user ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-gold text-gold hover:bg-gold hover:text-darker"
              >
                Sign Out
              </Button>
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
