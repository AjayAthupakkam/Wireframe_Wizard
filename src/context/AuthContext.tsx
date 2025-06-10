import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          console.log('[AuthContext] /api/auth/me response data:', data);
          
          if (data.success && data.data) {
            console.log('[AuthContext] Setting user with data.data:', data.data);
            setUser(data.data);
          } else {
            console.error('[AuthContext] Failed to load user or data.data missing:', data.message);
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setError('Failed to load user data');
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
