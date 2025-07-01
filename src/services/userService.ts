import { User } from '../types';

export class UserService {
  private static STORAGE_KEY = 'ecommerce_user';
  private static USERS_DB_KEY = 'ecommerce_users_db';
  
  // Initialize with some demo users
  private static initializeUsersDB(): void {
    const existingUsers = localStorage.getItem(this.USERS_DB_KEY);
    if (!existingUsers) {
      const demoUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123', // In real app, this would be hashed
          avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@eliteshop.com',
          password: 'admin123',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
        }
      ];
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(demoUsers));
    }
  }
  
  private static getUsersDB(): any[] {
    this.initializeUsersDB();
    const users = localStorage.getItem(this.USERS_DB_KEY);
    return users ? JSON.parse(users) : [];
  }
  
  private static saveUsersDB(users: any[]): void {
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(users));
  }
  
  private static findUserByEmail(email: string): any | null {
    const users = this.getUsersDB();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }
  
  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  static async login(email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    if (password.length < 3) {
      throw new Error('Password must be at least 3 characters');
    }
    
    // Check if user exists in our "database"
    const existingUser = this.findUserByEmail(email);
    if (!existingUser) {
      throw new Error('No account found with this email address. Please sign up first.');
    }
    
    // Check password (in real app, you'd compare hashed passwords)
    if (existingUser.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }
    
    // Create user session (exclude password from session)
    const user: User = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('userStateChanged', { 
        detail: { user, action: 'login' } 
      }));
      
      console.log(`✅ User ${user.name} logged in successfully!`);
      return user;
    } catch (error) {
      console.error('Error saving user session:', error);
      throw new Error('Failed to save user session');
    }
  }
  
  static async register(name: string, email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Basic validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }
    
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    
    // Check if user already exists
    const existingUser = this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In real app, this would be hashed
      avatar: `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150`
    };
    
    // Add to users database
    const users = this.getUsersDB();
    users.push(newUser);
    this.saveUsersDB(users);
    
    // Create user session (exclude password)
    const user: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('userStateChanged', { 
        detail: { user, action: 'register' } 
      }));
      
      console.log(`✅ User ${user.name} registered successfully!`);
      return user;
    } catch (error) {
      console.error('Error saving user session:', error);
      throw new Error('Failed to save user session');
    }
  }
  
  static logout(): void {
    try {
      const currentUser = this.getCurrentUser();
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('userStateChanged', { 
        detail: { user: null, action: 'logout', previousUser: currentUser } 
      }));
      
      console.log('✅ User logged out successfully!');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  // Helper method to get all registered users (for demo purposes)
  static getRegisteredUsers(): { email: string; name: string }[] {
    const users = this.getUsersDB();
    return users.map(user => ({
      email: user.email,
      name: user.name
    }));
  }
}