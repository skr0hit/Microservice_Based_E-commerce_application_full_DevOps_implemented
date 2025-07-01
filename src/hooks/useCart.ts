import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';
import { CartService } from '../services/cartService';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load cart on mount
  useEffect(() => {
    const initialCart = CartService.getCart();
    setCart(initialCart);
  }, []);
  
  // Listen for cart updates from any source
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      const { cart: updatedCart } = event.detail;
      setCart([...updatedCart]); // Force new array reference for React re-render
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ecommerce_cart') {
        const updatedCart = CartService.getCart();
        setCart([...updatedCart]);
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const addToCart = useCallback(async (product: any, quantity: number = 1) => {
    setIsLoading(true);
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedCart = CartService.addToCart(product, quantity);
      setCart([...updatedCart]); // Force re-render
      
      console.log(`✅ Added ${product.name} to cart! Cart now has ${CartService.getCartCount(updatedCart)} items`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const removeFromCart = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedCart = CartService.removeFromCart(productId);
      setCart([...updatedCart]);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedCart = CartService.updateQuantity(productId, quantity);
      setCart([...updatedCart]);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      CartService.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Calculate totals from current state
  const total = CartService.getCartTotal(cart);
  const itemCount = CartService.getCartCount(cart);
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isLoading
  };
}