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
// We now export a separate function to set up the interceptors.
// This function will be called from within AuthContext ONLY AFTER Firebase has provided a token.
// This guarantees that the interceptor has access to the correct, up-to-date token function.

export const setupAxiosInterceptors = (getAuthToken) => {
  apiClient.interceptors.request.eject(0); // Eject any previous interceptor to prevent duplicates
  
  const requestInterceptor = apiClient.interceptors.request.use(
    (config) => {
      NProgress.start();
      const token = getAuthToken(); // Call the function to get the latest token
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

  apiClient.interceptors.response.eject(0); // Eject previous response interceptor

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => {
      NProgress.done();
      return response;
    },
    (error) => {
      NProgress.done();
      if (error.response && error.response.status === 401) {
        console.error("Axios interceptor caught a 401 Unauthorized error. This may trigger a logout.");
        // The AuthContext will handle the actual logout logic.
      }
      return Promise.reject(error);
    }
  );
  
  return { requestInterceptor, responseInterceptor };
};

export default apiClient;
