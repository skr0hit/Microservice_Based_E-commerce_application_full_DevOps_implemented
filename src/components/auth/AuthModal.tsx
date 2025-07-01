import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { Mail, Lock, User, Info } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, register, isLoading } = useAuth();
  
  const demoUsers = [
    { email: 'john@example.com', password: 'password123', name: 'John Doe' },
    { email: 'jane@example.com', password: 'password123', name: 'Jane Smith' },
    { email: 'admin@eliteshop.com', password: 'admin123', name: 'Admin User' }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < (isLogin ? 3 : 6)) {
      newErrors.password = `Password must be at least ${isLogin ? 3 : 6} characters`;
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = 'Name is required';
    } else if (!isLogin && formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      
      // Success - close modal and reset form
      onClose();
      setFormData({ name: '', email: '', password: '' });
      setErrors({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setErrors({ general: errorMessage });
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };
  
  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setShowDemoUsers(false);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? 'Sign In' : 'Create Account'}
      size="sm"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              icon={User}
              required
              error={errors.name}
            />
          )}
          
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            icon={Mail}
            required
            error={errors.email}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder={`Enter your password (min ${isLogin ? 3 : 6} characters)`}
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            icon={Lock}
            required
            error={errors.password}
          />
          
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {errors.general}
            </div>
          )}
          
          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 space-y-4">
          {/* Demo Users Section */}
          {isLogin && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Info size={16} className="text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Demo Accounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoUsers(!showDemoUsers)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showDemoUsers ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showDemoUsers && (
                <div className="space-y-2">
                  {demoUsers.map((user, index) => (
                    <div key={index} className="bg-white p-2 rounded border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">Password: {user.password}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fillDemoCredentials(user.email, user.password)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-blue-600 mt-2">
                Only registered users can sign in. Create an account or use demo credentials above.
              </p>
            </div>
          )}
          
          {/* Toggle between login/register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}