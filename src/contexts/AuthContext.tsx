import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { UserProfile } from "@/services/user.service";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed:", error);
          // Token invalid, clear storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authService.register({ email, password, fullName });
      if (response.data?.user) {
        setUser(response.data.user);
        navigate("/dashboard");
        return { error: null };
      }
      return { error: new Error("Registration failed") };
    } catch (error: any) {
      return { 
        error: { 
          message: error.response?.data?.message || "Registration failed" 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        navigate("/dashboard");
        return { error: null };
      }
      return { error: new Error("Login failed") };
    } catch (error: any) {
      return { 
        error: { 
          message: error.response?.data?.message || "Invalid email or password" 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/auth");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
