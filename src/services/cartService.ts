import { CartItem, Product } from '../types';

export class CartService {
  private static STORAGE_KEY = 'ecommerce_cart';
  
  static getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }
  
  static addToCart(product: Product, quantity: number = 1): CartItem[] {
    try {
      const cart = this.getCart();
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ product, quantity });
      }
      
      this.saveCart(cart);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart, action: 'add', product, quantity } 
      }));
      
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }
  
  static removeFromCart(productId: string): CartItem[] {
    try {
      const cart = this.getCart();
      const filtered = cart.filter(item => item.product.id !== productId);
      this.saveCart(filtered);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart: filtered, action: 'remove', productId } 
      }));
      
      return filtered;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }
  
  static updateQuantity(productId: string, quantity: number): CartItem[] {
    try {
      const cart = this.getCart();
      const item = cart.find(item => item.product.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          return this.removeFromCart(productId);
        }
        item.quantity = quantity;
        this.saveCart(cart);
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { cart, action: 'update', productId, quantity } 
        }));
      }
      
      return cart;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  }
  
  static clearCart(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart: [], action: 'clear' } 
      }));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
  
  static getCartTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
  
  static getCartCount(cart: CartItem[]): number {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
  
  private static saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  }
}