import React, { useState } from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (isAdding || justAdded) return;
    
    setIsAdding(true);
    
    try {
      await onAddToCart(product);
      
      // Show success state
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      
      console.log(`✅ Successfully added ${product.name} to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square overflow-hidden" onClick={() => onClick(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
            -{discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div onClick={() => onClick(product)}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.stockCount <= 5 && product.inStock && (
              <p className="text-xs text-orange-600">Only {product.stockCount} left!</p>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            loading={isAdding}
            icon={justAdded ? Check : ShoppingCart}
            className={`min-w-[100px] transition-all duration-300 ${
              justAdded 
                ? 'bg-green-600 hover:bg-green-700 text-white scale-105' 
                : ''
            }`}
          >
            {isAdding ? 'Adding...' : justAdded ? 'Added!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}