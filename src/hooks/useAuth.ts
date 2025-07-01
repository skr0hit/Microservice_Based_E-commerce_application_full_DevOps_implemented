import { useState, useEffect } from 'react';
import { User } from '../types';
import { UserService } from '../services/userService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = UserService.getCurrentUser();
        setUser(currentUser);
        console.log('🔐 Auth initialized:', currentUser ? `User: ${currentUser.name}` : 'No user');
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Listen for user state changes from any source
  useEffect(() => {
    const handleUserStateChange = (event: CustomEvent) => {
      const { user: updatedUser, action } = event.detail;
      console.log(`🔐 User state changed: ${action}`, updatedUser);
      setUser(updatedUser);
      setError(null);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ecommerce_user') {
        const updatedUser = UserService.getCurrentUser();
        console.log('🔐 Storage change detected:', updatedUser);
        setUser(updatedUser);
      }
    };
    
    window.addEventListener('userStateChanged', handleUserStateChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔐 Attempting login for: ${email}`);
      const loggedInUser = await UserService.login(email, password);
      
      // User state will be updated via the event listener
      // But we also set it directly for immediate feedback
      setUser(loggedInUser);
      
      return loggedInUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('🔐 Login failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔐 Attempting registration for: ${email}`);
      const registeredUser = await UserService.register(name, email, password);
      
      // User state will be updated via the event listener
      // But we also set it directly for immediate feedback
      setUser(registeredUser);
      
      return registeredUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      console.error('🔐 Registration failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    try {
      console.log('🔐 Logging out user...');
      UserService.logout();
      
      // User state will be updated via the event listener
      // But we also set it directly for immediate feedback
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('🔐 Logout failed:', error);
    }
  };
  
  return {
    user,
    isLoading,
    error,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}