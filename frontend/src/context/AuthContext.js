// FILE: src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import apiClient from '../api/axiosConfig'; // The interceptor in this file will now handle the token
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState('personal');

  // fetchDbUser now relies on the axios interceptor for its auth token.
  const fetchDbUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me');
      setDbUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch DB user. This likely means the stored token is invalid. Forcing logout.", error);
      // If we can't get our user, the token is bad. Log out completely.
      await signOut(auth);
      return null;
    }
  }, []);

  // [THE DEFINITIVE FIX - FINAL VERSION]
  // This useEffect now manages the token in localStorage, which is read by the axios interceptor.
  // This is the most robust pattern, immune to React rendering race conditions.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const token = await user.getIdToken(true);
          
          // 1. Store the token in localStorage. The Axios interceptor will read from here.
          localStorage.setItem('firebaseAuthToken', token);
          
          setCurrentUser(user);
          
          // 2. Now that the token is stored, fetch our application-specific user data.
          await fetchDbUser();

        } catch (error) {
            console.error("Critical error during auth state change. Forcing logout.", error);
            localStorage.removeItem('firebaseAuthToken');
            setCurrentUser(null);
            setDbUser(null);
            await signOut(auth);
        }
      } else {
        // No user is signed in. Clear everything.
        localStorage.removeItem('firebaseAuthToken');
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchDbUser]);

  const login = async (email, password) => {
    // This function's only job is to sign in with Firebase.
    // The onAuthStateChanged listener above will handle the entire application state update.
    const toastId = toast.loading('Logging in...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!', { id: toastId });
    } catch (error) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password.' 
        : 'An error occurred. Please check your connection and try again.';
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const register = async (email, password, fullName, country_code, phone_number) => {
    const toastId = toast.loading('Creating your account...');
    try {
      // Step 1: Create the user in Firebase.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      
      // Step 2: [SIMPLIFIED] Send user info to our backend.
      // This is still useful if you need to pass extra info not available to the JIT endpoint.
      const token = await user.getIdToken();
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Temporarily set header for this one call
      await apiClient.post('/auth/complete-registration', {
          firebase_uid: user.uid, email, full_name: fullName, country_code, phone_number,
      });
      delete apiClient.defaults.headers.common['Authorization']; // Unset temporary header

      toast.success('Registration successful! Welcome.', { id: toastId });
      // The onAuthStateChanged listener will automatically log them in and fetch their data.
      
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
             toast.error('This email address is already registered.', { id: toastId });
        } else {
            toast.error(error.response?.data?.detail || 'Registration failed. Please try again.', { id: toastId });
        }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('You have been logged out.');
  };

  const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
        toast.error('Failed to send password reset email.');
        throw error;
    }
  };

   const switchToBusiness = () => {
        if (dbUser?.business_profile) {
            setActiveProfile('business');
            toast.success(`Switched to ${dbUser.business_profile.business_name}`);
        }
    };

    const switchToPersonal = () => {
        setActiveProfile('personal');
    };
    
    // [THE UPGRADE] Implement role-based overrides for subscription features.
    const hasActiveSubscription = useCallback((plan_id = null) => {
        if (!dbUser) return false;
        // Superusers have access to everything.
        if (dbUser.role === 'superuser') return true;
        // Admins have access to premium features and below.
        if (dbUser.role === 'admin' && plan_id !== 'ultimate') return true;

        const sub = dbUser.subscription;
        if (!sub || sub.status !== 'active') return false;
        
        if (plan_id) {
            const planHierarchy = { free: 0, premium: 1, ultimate: 2 };
            const userPlanLevel = planHierarchy[sub.plan.id] ?? -1;
            const requiredPlanLevel = planHierarchy[plan_id] ?? -1;
            return userPlanLevel >= requiredPlanLevel;
        }
        return true;
    }, [dbUser]);

  const value = {
    currentUser,
    dbUser,
    isAuthenticated: !!dbUser,
    isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'superuser',
    loading,
    login,
    register,
    logout,
    resetPassword,
    fetchDbUser,
    activeProfile,
    switchToBusiness,
    switchToPersonal,
    hasActiveSubscription,
  };

  return (
        <AuthContext.Provider value={value}>
            {/* Don't render children until the initial auth check is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
