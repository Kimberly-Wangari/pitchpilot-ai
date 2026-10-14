
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

export default api;
