
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Profile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const userProfile = await api.getProfile(userId);
    if (userProfile) {
      setProfile(userProfile);
    }
  };
  
  const reloadProfile = async () => {
    if (user) {
        await fetchProfile(user.id);
    }
  }

  useEffect(() => {
    // This simulates checking for an existing session
    const checkSession = async () => {
      setLoading(true);
      // To simulate a logged-out state initially, comment out the following lines
      // and uncomment the setLoading(false).
      
      // To simulate being logged in:
      try {
        const loggedInUser = await api.loginWithGoogle();
        setUser(loggedInUser);
        await fetchProfile(loggedInUser.id);
      } catch (error) {
        console.error("Auto-login failed", error);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async () => {
    setLoading(true);
    const loggedInUser = await api.loginWithGoogle();
    setUser(loggedInUser);
    await fetchProfile(loggedInUser.id);
    setLoading(false);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
  };
  
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, reloadProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
