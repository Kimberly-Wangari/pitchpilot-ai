
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  // Required for the OAuth login-ticket cookie
  withCredentials: true,
});

// Automatically attach JWT to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "pitchpilot_token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle suspended accounts globally
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 403 &&
      code === "ACCOUNT_SUSPENDED"
    ) {
      // Remove the JWT immediately.
      localStorage.removeItem("pitchpilot_token");

      // Preserve the suspension message for login.
      sessionStorage.setItem(
        "pitchpilot_auth_notice",
        "Your account has been suspended. Please contact the administrator."
      );

      // Avoid repeated redirects.
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
