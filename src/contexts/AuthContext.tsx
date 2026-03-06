import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../services/api';

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  profile_pic: string | null;
  role: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  country?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; phone: string; role?: string }) => Promise<{ userId?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      const result = await api.parseResponse<{ data?: UserProfile }>(res);
      if (result.data) {
        setUser(result.data);
        localStorage.setItem('is_logged_in', 'true');
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    api.setOnSessionExpired(() => {
      setUser(null);
    });

    return () => api.setOnSessionExpired(null);
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password }, { useAuth: false });
    const result = await api.parseResponse<{ data?: any }>(res);
    const token = result.data?.jwt || result.data?.token;
    if (!token) throw new Error('No token received');
    api.setToken(token);
    localStorage.setItem('is_logged_in', 'true');
    if (result.data?.user_id) {
      setUser(result.data as UserProfile);
      localStorage.setItem('user_role', result.data.role || 'client');
    } else {
      await fetchProfile();
    }
  };

  const signup = async (data: { email: string; password: string; phone: string; role?: string }) => {
    const res = await api.post('/auth/register', data, { useAuth: false });
    const result = await api.parseResponse<{ data?: { userId?: string; user_id?: string } }>(res);
    return { userId: result.data?.userId || result.data?.user_id };
  };

  const logout = () => {
    api.triggerLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
