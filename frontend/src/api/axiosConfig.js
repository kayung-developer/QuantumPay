// FILE: src/api/axiosConfig.js

import axios from 'axios';
import NProgress from '../utils/nprogress';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("FATAL ERROR: REACT_APP_API_BASE_URL is not defined.");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// [THE DEFINITIVE FIX]
// Export a function to set up interceptors. This will be called by AuthContext
// after Firebase is initialized, ensuring the token logic is always correct.
export const setupAxiosInterceptors = (getAuthToken) => {
  // Clear any existing interceptors to prevent duplicates during hot-reloads
  // A more robust way to handle this is to store the interceptor ID and eject it.
  if (apiClient.interceptors.request.handlers.length > 0) {
      apiClient.interceptors.request.eject(0);
  }
  if (apiClient.interceptors.response.handlers.length > 0) {
      apiClient.interceptors.response.eject(0);
  }

  apiClient.interceptors.request.use(
    (config) => {
      NProgress.start();
      const token = getAuthToken(); // Dynamically get the latest token

      // This is the final safeguard. If the token is null or undefined,
      // the Authorization header is simply not added.
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      NProgress.done();
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      NProgress.done();
      return response;
    },
    (error) => {
      NProgress.done();
      if (error.response && error.response.status === 401) {
        console.error("Axios interceptor caught a 401 Unauthorized error. This might indicate an expired session.");
        // A global logout could be triggered here if needed.
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
