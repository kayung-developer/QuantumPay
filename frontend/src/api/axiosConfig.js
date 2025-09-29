// FILE: src/api/axiosConfig.js

import axios from 'axios';
import NProgress from '../utils/nprogress';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("FATAL ERROR: REACT_APP_API_BASE_URL is not defined. Please check your .env file.");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Increased timeout for potentially slow API responses
});

// [THE DEFINITIVE FIX]
// This request interceptor is the key to solving the race condition.
// Instead of setting a static default header, this function runs BEFORE every single API call.
// It will dynamically get the latest token from localStorage (where we'll save it)
// and inject it into the request's headers at the last possible moment.
// This completely eliminates any timing issues.

apiClient.interceptors.request.use(
  (config) => {
    NProgress.start();
    // Get the token from storage for each request
    const token = localStorage.getItem('firebaseAuthToken');
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
    // This is where you could add global error handling, e.g.,
    // if you get a 401, you could trigger a logout.
    if (error.response && error.response.status === 401) {
       // The AuthContext will handle the logout, but you could add a toast here.
       console.error("Axios interceptor caught a 401 Unauthorized error.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
