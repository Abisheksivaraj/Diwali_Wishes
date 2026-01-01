import axios from "axios";

export const API_URL = "https://bulk-mail-zzmy.onrender.com";

// Check if online
export const isOnline = () => navigator.onLine;

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60 seconds for MongoDB operations
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
