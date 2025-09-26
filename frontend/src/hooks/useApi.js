import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const useApi = (url, options = {}, manual = false) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!manual);

  const fetchData = useCallback(async (requestOptions) => {
    setLoading(true);
    setError(null);
    try {
      const finalOptions = { ...options, ...requestOptions };
      const response = await apiClient(url, finalOptions);
      setData(response.data);

      // --- [THE FIX] ---
      // We only show a success toast if the backend explicitly provides a message.
      // Generic success toasts for GET requests are removed to avoid excessive pop-ups.
      if (response.data && typeof response.data === 'object' && response.data.message) {
        toast.success(response.data.message);
      }
      // We no longer have the generic 'else if' that was causing a toast on every data fetch.

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
      const errorStatus = err.response?.status;
      const errorData = err.response?.data;
      
      const structuredError = {
          message: errorMessage,
          status: errorStatus,
          data: errorData
      };
      setError(structuredError);

      console.error(`API Error on ${url}:`, structuredError);
      // It's better to show error toasts here, as users need to be aware of failures.
      toast.error(errorMessage);
      return { success: false, error: structuredError };
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    if (!manual) {
      fetchData();
    }
  }, [fetchData, manual]);

  return { data, error, loading, request: fetchData };
};

export default useApi;
