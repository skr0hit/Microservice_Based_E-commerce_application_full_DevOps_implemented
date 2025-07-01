import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, Check } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(product.stockCount, quantity + delta)));
  };
  
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                    selectedImage === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            {product.stockCount <= 5 && product.inStock && (
              <p className="text-orange-600 font-medium">Only {product.stockCount} left in stock!</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
          
          {/* Features */}
          {product.features.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors duration-200"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                  disabled={quantity >= product.stockCount}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.stockCount} available
              </span>
            </div>
            
            <div className="flex space-x-3">
              <Button
                size="lg"
                onClick={() => onAddToCart(product, quantity)}
                disabled={!product.inStock}
                icon={ShoppingCart}
                className="flex-1"
              >
                Add to Cart
              </Button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
              </button>
              <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          {!product.inStock && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-700 font-medium">This item is currently out of stock</p>
              <p className="text-sm text-gray-600 mt-1">Check back later or explore similar products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}