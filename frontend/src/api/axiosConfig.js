import axios from 'axios';

// Get the API base URL from environment variables.
// This makes it easy to switch between development, staging, and production environments.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// A basic check to ensure the environment variable is set.
if (!API_BASE_URL) {
  console.error(
    "FATAL ERROR: REACT_APP_API_BASE_URL is not defined. Please check your .env file."
  );
}

// Create a new Axios instance with custom configuration.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Set a default timeout for requests (e.g., 10 seconds)
  timeout: 10000,
});

/**
 * We can also add interceptors here for advanced request/response handling.
 * This is a production-grade practice for handling things like token refreshing
 * or global error handling. For now, we'll keep it simple, but the structure is here.
 *
 * apiClient.interceptors.response.use(
 *   (response) => {
 *     // Any status code that lie within the range of 2xx cause this function to trigger
 *     return response;
 *   },
 *   async (error) => {
 *     const originalRequest = error.config;
 *
 *     // Handle specific error codes globally if needed
 *     if (error.response?.status === 401 && !originalRequest._retry) {
 *       // For example, if a token is expired, you could try to refresh it.
 *       // This logic would be implemented within the AuthContext.
 *       console.error("Authentication error. Token may be expired.");
 *       // In a real system with refresh tokens:
 *       // originalRequest._retry = true;
 *       // const newAccessToken = await refreshAccessToken();
 *       // axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
 *       // return apiClient(originalRequest);
 *     }
 *
 *     // Any status codes that falls outside the range of 2xx cause this function to trigger
 *     return Promise.reject(error);
 *   }
 * );
 */

export default apiClient;