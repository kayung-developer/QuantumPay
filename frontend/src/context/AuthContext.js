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
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState('personal');

  const fetchDbUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me');
      setDbUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch DB user. Forcing logout.", error);
      // This automatically triggers the onAuthStateChanged listener to clean up the state.
      await signOut(auth);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const token = await user.getIdToken(true);
          localStorage.setItem('firebaseAuthToken', token);
          await fetchDbUser();
        } catch (error) {
            console.error("Critical error during auth state change. Forcing logout.", error);
            localStorage.removeItem('firebaseAuthToken');
            await signOut(auth);
        }
      } else {
        localStorage.removeItem('firebaseAuthToken');
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchDbUser]);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
  };
  
  const logout = async () => {
    await signOut(auth);
    setActiveProfile('personal');
    toast.success('You have been logged out.');
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent.');
  };
  
  const switchToBusiness = () => {
    if (dbUser?.business_profile) setActiveProfile('business');
  };

  const switchToPersonal = () => {
    setActiveProfile('personal');
  };
    
  const hasActiveSubscription = useCallback((plan_id = null) => {
    if (!dbUser) return false;
    if (dbUser.role === 'superuser') return true;
    if (dbUser.role === 'admin' && plan_id !== 'ultimate') return true;
    const sub = dbUser.subscription;
    if (!sub || sub.status !== 'active') return false;
    if (plan_id) {
        const planHierarchy = { free: 0, premium: 1, ultimate: 2 };
        return (planHierarchy[sub.plan.id] ?? -1) >= (planHierarchy[plan_id] ?? -1);
    }
    return true;
  }, [dbUser]);

  const value = {
    currentUser,
    dbUser,
    // [THE DEFINITIVE FIX] The single source of truth for authentication status.
    isAuthenticated: !loading && !!dbUser,
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
      {children}
    </AuthContext.Provider>
  );
};
