
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "pitchpilot_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing authenticated session
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch (error) {
        console.error(
          "Unable to restore authentication:",
          error
        );

        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Shared session handler for all authentication methods
  const saveSession = ({ token, user }) => {
    if (!token || !user) {
      throw new Error("Invalid authentication response.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  // Register using email and password
  const register = async (formData) => {
    const response = await api.post(
      "/auth/register",
      formData
    );

    saveSession(response.data);

    return response.data;
  };

  // Sign in using email and password
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    saveSession(response.data);

    return response.data;
  };

  // Complete Google, Microsoft or Apple authentication
  const completeOAuthLogin = (authData) => {
    saveSession(authData);
  };

  // Start social authentication
  
const startSocialLogin = (provider) => {
  if (provider !== "google") {
    return;
  }

  window.location.assign(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/oauth/google/start`
  );
};


  // Log out
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        completeOAuthLogin,
        startSocialLogin,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider."
    );
  }

  return context;
}
export default AuthContext;