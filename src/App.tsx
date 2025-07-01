import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { ProductCard } from './components/product/ProductCard';
import { ProductDetail } from './components/product/ProductDetail';
import { CartSidebar } from './components/cart/CartSidebar';
import { AuthModal } from './components/auth/AuthModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { ProductService } from './services/productService';
import { Product, Category } from './types';
import { Smartphone, Shirt, Sparkles, Coffee, Home, Dumbbell, Filter } from 'lucide-react';

const categoryIcons = {
  Smartphone,
  Shirt,
  Sparkles,
  Coffee,
  Home,
  Dumbbell
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { user, isInitialized } = useAuth();
  
  // Listen for user state changes to update UI
  useEffect(() => {
    const handleUserStateChange = (event: CustomEvent) => {
      const { action, user: updatedUser } = event.detail;
      console.log(`🎯 App received user state change: ${action}`, updatedUser);
      
      // Close auth modal when user logs in/registers
      if ((action === 'login' || action === 'register') && updatedUser) {
        setIsAuthModalOpen(false);
        setNotification(`Welcome ${updatedUser.name}! 🎉`);
        setTimeout(() => setNotification(null), 3000);
      }
      
      // Show logout notification
      if (action === 'logout') {
        setNotification('Signed out successfully');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    
    window.addEventListener('userStateChanged', handleUserStateChange as EventListener);
    
    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChange as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (isInitialized) {
      loadInitialData();
    }
  }, [isInitialized]);
  
  useEffect(() => {
    if (isInitialized) {
      loadProducts();
    }
  }, [selectedCategory, searchQuery, isInitialized]);
  
  const loadInitialData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProducts = async () => {
    try {
      const productsData = await ProductService.getProducts(selectedCategory, searchQuery);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };
  
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      console.log(`🛒 Adding ${product.name} to cart...`);
      await addToCart(product, quantity);
      
      // Show success notification
      setNotification(`${product.name} added to cart!`);
      setTimeout(() => setNotification(null), 3000);
      
      console.log(`✅ Successfully added ${product.name} to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setNotification('Failed to add item to cart');
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(''); // Clear category filter when searching
  };
  
  // Show loading screen until auth is initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EliteShop...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <p className="font-medium">{notification}</p>
          </div>
        </div>
      )}
      
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onSearch={handleSearch}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Shop the latest trends with fast shipping and unbeatable prices
            </p>
            <Button size="lg" variant="secondary">
              Explore Now
            </Button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {IconComponent && <IconComponent size={16} />}
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Products'}
              <span className="text-gray-500 font-normal ml-2">({products.length})</span>
            </h2>
            <Button variant="outline" icon={Filter} size="sm">
              Filters
            </Button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Smartphone size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Modals */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        size="xl"
      >
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={handleAddToCart}
          />
        )}
      </Modal>
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}

export default App;