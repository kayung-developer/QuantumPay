import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


export const useApi = (url, options = {}, manual = false) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!manual);
  const { authToken } = useAuth();
  const optionsString = useMemo(() => JSON.stringify(options), [options]);

  const request = useCallback(async (requestOptions) => {
      if (!authToken) {
          return { success: false, error: { message: "Authentication token not yet available." } };
      }
      setLoading(true);
      setError(null);
      try {
          const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
          const response = await apiClient(url, {
              method: 'GET',
              headers: { Authorization: `Bearer ${authToken}` },
              ...finalOptions,
          });
          setData(response.data);
          return { success: true, data: response.data };
      } catch (err) {
          const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
          const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
          setError(structuredError);
          console.error(`API GET Error on ${url}:`, structuredError);
          return { success: false, error: structuredError };
      } finally {
          setLoading(false);
      }
  }, [url, authToken, optionsString]);

  useEffect(() => {
      if (!manual && authToken) {
          request();
      }
      if (!authToken && !manual) {
          setLoading(false);
      }
  }, [request, manual, authToken]);

  return { data, error, loading, request };
};

export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth(); // Get the auth token
    
    const configString = useMemo(() => JSON.stringify(config), [config]);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);
        
        // [THE DEFINITIVE FIX] Add a guard clause to prevent API calls without a token.
        if (!authToken) {
            const errorMessage = "You are not authenticated. Please log in again.";
            toast.error(errorMessage);
            setError({ message: errorMessage });
            setLoading(false);
            return { success: false, error: { message: errorMessage } };
        }

        try {
            const baseConfig = JSON.parse(configString);
            const finalConfig = { ...baseConfig, ...requestConfig };
            const method = finalConfig.method?.toLowerCase() || 'post';
            const finalUrl = finalConfig.url || url;

            const response = await apiClient({
                url: finalUrl,
                method: method,
                data: postData,
                headers: { Authorization: `Bearer ${authToken}` },
                ...finalConfig.headers,
            });

            setData(response.data);

            if (response.data && typeof response.data === 'object' && response.data.message) {
                toast.success(response.data.message, { id: response.data.message });
            }
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
            const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
            setError(structuredError);
            toast.error(errorMessage, { id: errorMessage });
            console.error(`API POST/PUT/DELETE Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, configString]);

    return { post, data, loading, error };
};


// [THE DEFINITIVE FIX] Add this default export line at the end of the file.
// This allows other files to use `import useApi from ...` without causing an error.
export default useApi;



