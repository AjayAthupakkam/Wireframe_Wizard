import { createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

// This interface matches the shape expected by components using the old AuthContext
interface AuthContextType {
  user: any; // To maintain compatibility with existing code
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const ClerkAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const ClerkAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  
  // Create a user object that matches the shape expected by the old AuthContext
  const adaptedUser = user ? {
    id: user.id,
    name: user.fullName || user.username || 'User',
    email: user.primaryEmailAddress?.emailAddress || ''
  } : null;

  // Mock functions that are expected by components using the old AuthContext
  const register = async () => {
    console.log("Register is now handled by Clerk UI components");
  };

  const login = async () => {
    console.log("Login is now handled by Clerk UI components");
  };

  const logout = () => {
    clerk.signOut();
  };

  const clearError = () => {
    // No-op as Clerk handles errors internally
  };

  const value = {
    user: adaptedUser,
    token: user ? "clerk-token" : null, // Clerk handles tokens internally
    loading: !isLoaded,
    error: null,
    register,
    login,
    logout,
    clearError
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
};
