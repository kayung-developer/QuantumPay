import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase'; // Assuming your firebase config is in 'src/firebase.js'
import apiClient from '../api/axiosConfig'; // Import your configured axios instance
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = useCallback(async () => {
    try {
      // This request will now have the auth header because we set it in onAuthStateChanged
      const response = await apiClient.get('/users/me');
      setDbUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch DB user:", error);
      // If fetching the user fails, it's a critical error, log them out.
      await signOut(auth);
      return null;
    }
  }, []);


  // This useEffect is the core of the fix.
  // It listens for Firebase auth changes and syncs the token with apiClient.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // 1. Get the token from Firebase
          const token = await user.getIdToken();

          // 2. Set the token as a default header for all future axios requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 3. Now, fetch user data from your backend with the authenticated request
          await fetchDbUser();

        } catch (error) {
            console.error("Error during auth state change handling:", error);
            // If token fetching or db user fetch fails, force logout.
            await signOut(auth);
            apiClient.defaults.headers.common['Authorization'] = null;
        }

      } else {
        // No user is signed in
        setCurrentUser(null);
        setDbUser(null);
        // Clear the authorization header
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchDbUser]);


  const login = async (email, password) => {
    const toastId = toast.loading('Signing in...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to sign in.', { id: toastId });
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    const toastId = toast.loading('Creating account...');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();

        // After creating the user in Firebase, create them in your backend database
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await apiClient.post('/users/register', {
            full_name: fullName,
            email: email,
            firebase_uid: userCredential.user.uid,
        });

      toast.success('Account created successfully!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to register.', { id: toastId });
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Signed out successfully.');
  };

  const resetPassword = async (email) => {
      await sendPasswordResetEmail(auth, email);
      // No toast here, the UI handles the confirmation message
  };


  const value = {
    currentUser,
    dbUser,
    isAuthenticated: !!dbUser, // User is authenticated only if we have their details from our DB
    isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'superuser',
    loading,
    login,
    register,
    logout,
    resetPassword,
    fetchDbUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};