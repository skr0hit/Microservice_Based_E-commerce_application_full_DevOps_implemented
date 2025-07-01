import { Product, Category } from '../types';

// Simulated product data
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation and 30-hour battery life.',
    category: 'electronics',
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    stockCount: 15,
    features: ['Active Noise Cancellation', '30h Battery Life', 'Quick Charge', 'Premium Materials']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 249.99,
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.',
    category: 'electronics',
    images: [
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.6,
    reviews: 892,
    inStock: true,
    stockCount: 23,
    features: ['Heart Rate Monitor', 'GPS Tracking', '7-day Battery', 'Water Resistant']
  },
  {
    id: '3',
    name: 'Minimalist Backpack',
    price: 89.99,
    originalPrice: 119.99,
    description: 'A sleek, minimalist backpack perfect for daily commuting with laptop compartment and water-resistant material.',
    category: 'fashion',
    images: [
      'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2422278/pexels-photo-2422278.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.7,
    reviews: 456,
    inStock: true,
    stockCount: 8,
    features: ['Laptop Compartment', 'Water Resistant', 'Ergonomic Design', 'Multiple Pockets']
  },
  {
    id: '4',
    name: 'Organic Green Tea Set',
    price: 34.99,
    description: 'Premium organic green tea collection featuring 6 unique blends sourced from sustainable farms.',
    category: 'food',
    images: [
      'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.9,
    reviews: 234,
    inStock: true,
    stockCount: 42,
    features: ['Organic Certified', '6 Unique Blends', 'Sustainable Sourcing', 'Premium Quality']
  },
  {
    id: '5',
    name: 'Professional Camera Lens',
    price: 599.99,
    description: 'High-quality professional camera lens with superior optics for stunning photography.',
    category: 'electronics',
    images: [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.8,
    reviews: 167,
    inStock: true,
    stockCount: 5,
    features: ['Professional Grade', 'Superior Optics', 'Weather Sealed', 'Fast Autofocus']
  },
  {
    id: '6',
    name: 'Luxury Skincare Set',
    price: 149.99,
    originalPrice: 199.99,
    description: 'Complete luxury skincare routine with natural ingredients for radiant, healthy skin.',
    category: 'beauty',
    images: [
      'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.7,
    reviews: 689,
    inStock: true,
    stockCount: 12,
    features: ['Natural Ingredients', 'Dermatologist Tested', 'Anti-Aging Formula', 'Paraben Free']
  }
];

const CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: 'Smartphone' },
  { id: '2', name: 'Fashion', slug: 'fashion', icon: 'Shirt' },
  { id: '3', name: 'Beauty', slug: 'beauty', icon: 'Sparkles' },
  { id: '4', name: 'Food & Beverage', slug: 'food', icon: 'Coffee' },
  { id: '5', name: 'Home & Garden', slug: 'home', icon: 'Home' },
  { id: '6', name: 'Sports', slug: 'sports', icon: 'Dumbbell' }
];

export class ProductService {
  static async getProducts(category?: string, search?: string): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...PRODUCTS];
    
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }
  
  static async getProduct(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return PRODUCTS.find(product => product.id === id) || null;
  }
  
  static async getCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return CATEGORIES;
  }
  
  static async getFeaturedProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return PRODUCTS.filter(product => product.originalPrice).slice(0, 4);
  }
}