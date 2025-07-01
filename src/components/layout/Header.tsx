import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onCartClick, onAuthClick, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartBadgeKey, setCartBadgeKey] = useState(0); // Force re-render of cart badge
  const [userDisplayKey, setUserDisplayKey] = useState(0); // Force re-render of user display
  
  const { itemCount } = useCart();
  const { user, logout, isInitialized } = useAuth();
  
  // Force cart badge animation when count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartBadgeKey(prev => prev + 1);
    }
  }, [itemCount]);
  
  // Listen for real-time updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // Force component re-render by updating key
      setCartBadgeKey(prev => prev + 1);
    };
    
    const handleUserStateChange = (event: CustomEvent) => {
      const { action, user: updatedUser } = event.detail;
      console.log(`🎯 Header received user state change: ${action}`, updatedUser);
      
      // Force user display re-render
      setUserDisplayKey(prev => prev + 1);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('userStateChanged', handleUserStateChange as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('userStateChanged', handleUserStateChange as EventListener);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };
  
  // Don't render until auth is initialized
  if (!isInitialized) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EliteShop
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EliteShop
              </h1>
            </div>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch}>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={setSearchQuery}
                icon={Search}
                className="w-full"
              />
            </form>
          </div>
          
          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span 
                  key={cartBadgeKey}
                  className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce"
                  style={{ animationDuration: '0.6s', animationIterationCount: '2' }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div key={userDisplayKey} className="flex items-center space-x-3 animate-fade-in">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 animate-scale-in"
                />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={onAuthClick} icon={User}>
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={setSearchQuery}
                icon={Search}
              />
            </form>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onCartClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart size={20} />
                <span>Cart ({itemCount})</span>
              </button>
              
              {user ? (
                <div key={userDisplayKey} className="flex items-center space-x-2 animate-fade-in">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    onAuthClick();
                    setIsMobileMenuOpen(false);
                  }} 
                  size="sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}