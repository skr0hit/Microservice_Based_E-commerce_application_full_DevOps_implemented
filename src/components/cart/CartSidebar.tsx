import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, total, itemCount, isLoading } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  // Auto-close sidebar when cart becomes empty
  useEffect(() => {
    if (isOpen && cart.length === 0 && !isLoading) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cart.length, isOpen, onClose, isLoading]);
  
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  
  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && cart.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const isUpdating = updatingItems.has(item.product.id);
                  
                  return (
                    <div 
                      key={item.product.id} 
                      className={`flex items-center space-x-4 bg-gray-50 rounded-lg p-3 transition-opacity duration-200 ${
                        isUpdating ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium min-w-[20px] text-center">
                            {isUpdating ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                            disabled={item.quantity >= item.product.stockCount || isUpdating}
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50"
                            disabled={isUpdating}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                size="lg"
                onClick={onCheckout}
                className="w-full"
                disabled={isLoading}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}