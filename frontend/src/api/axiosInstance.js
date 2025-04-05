// frontend/src/api/axiosInstance.js
import axios from 'axios';
import { authTokensRef } from '../context/AuthContext';

// Use the backend base URL (adjust if needed, maybe use environment variables later)
const API_BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Example timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // THIS IS THE IMPORTANT PART for HttpOnly Cookies:
  withCredentials: true
});


axiosInstance.interceptors.request.use(
    (config) => {
      // Get the token from the ref object
      const token = authTokensRef.accessToken;
      if (token) {
        // If the token exists, add the Authorization header
        config.headers['Authorization'] = `Bearer ${token}`;
        // console.log("Attaching token:", token); // Optional: for debugging
      } else {
        // Optional: delete header if no token, just in case
        delete config.headers['Authorization'];
      }
      return config; // Return the modified config
    },
    (error) => {
      // Handle request errors
      return Promise.reject(error);
    }
);
export default axiosInstance;