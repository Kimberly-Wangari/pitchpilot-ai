
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

  // RESTORE EXISTING SESSION

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

  // SAVE AUTHENTICATED SESSION

  const saveSession = ({ token, user }) => {
    if (!token || !user) {
      throw new Error("Invalid authentication response.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  // REGISTER

  const register = async (formData) => {
    const response = await api.post(
      "/auth/register",
      formData
    );

    return response.data;
  };

  // LOGIN

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  };

  // VERIFY REGISTRATION OR LOGIN OTP

  const verifyOtp = async (challengeId, code) => {
    const response = await api.post(
      "/auth/verify-otp",
      {
        challengeId,
        code,
      }
    );

    saveSession(response.data);

    return response.data;
  };

  // RESEND OTP

  const resendOtp = async (challengeId) => {
    const response = await api.post(
      "/auth/resend-otp",
      {
        challengeId,
      }
    );

    return response.data;
  };

  // FORGOT PASSWORD — REQUEST OTP

  const requestPasswordReset = async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  };

  // FORGOT PASSWORD — VERIFY OTP

  const verifyPasswordReset = async (
    challengeId,
    code
  ) => {
    const response = await api.post(
      "/auth/verify-reset",
      {
        challengeId,
        code,
      }
    );

    return response.data;
  };

  // FORGOT PASSWORD — UPDATE PASSWORD

  const completePasswordReset = async (
    challengeId,
    resetToken,
    newPassword,
    confirmPassword
  ) => {
    const response = await api.post(
      "/auth/reset-password",
      {
        challengeId,
        resetToken,
        newPassword,
        confirmPassword,
      }
    );

    return response.data;
  };

  // COMPLETE GOOGLE AUTHENTICATION

  const completeOAuthLogin = (authData) => {
    saveSession(authData);
  };

  // START GOOGLE SIGN-IN

  const startSocialLogin = (provider) => {
    if (provider !== "google") {
      return;
    }

    window.location.assign(
      `${
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api"
      }/oauth/google/start`
    );
  };

  // REFRESH CURRENT USER PROFILE

  const refreshUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error("You must be signed in.");
    }

    const response = await api.get("/auth/me");

    setUser(response.data.user);

    return response.data.user;
  };

  // UPDATE FIRST AND LAST NAME

  const updateProfile = async ({
    firstName,
    lastName,
  }) => {
    const nextFirstName = firstName?.trim();
    const nextLastName = lastName?.trim();

    if (!nextFirstName || !nextLastName) {
      throw new Error(
        "First name and last name are required."
      );
    }

    if (
      nextFirstName.length > 100 ||
      nextLastName.length > 100
    ) {
      throw new Error(
        "Names must be 100 characters or fewer."
      );
    }

    const response = await api.patch(
      "/auth/profile",
      {
        firstName: nextFirstName,
        lastName: nextLastName,
      }
    );

    const updatedUser = response.data.user;

    if (!updatedUser) {
      throw new Error(
        "The server did not return the updated profile."
      );
    }

    // Synchronize the name across the application.
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }));

    return response.data;
  };

  // LOGOUT

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // PROVIDE AUTHENTICATION FUNCTIONS

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        verifyOtp,
        resendOtp,
        requestPasswordReset,
        verifyPasswordReset,
        completePasswordReset,
        logout,
        completeOAuthLogin,
        startSocialLogin,
        refreshUser,
        updateProfile,
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
