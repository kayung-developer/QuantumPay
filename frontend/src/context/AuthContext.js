// FILE: src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import apiClient, { setupAxiosInterceptors } from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState('personal');

  const tokenRef = useRef(null);

  const fetchDbUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me');
      setDbUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch DB user. Forcing logout.", error);
      await signOut(auth);
      return null;
    }
  }, []);

  useEffect(() => {
    // Setup the interceptor ONCE. It will dynamically get the token from the ref.
    setupAxiosInterceptors(() => tokenRef.current);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          tokenRef.current = token; // Set the ref for the interceptor
          setCurrentUser(user);
          await fetchDbUser();
        } catch (error) {
          console.error("Critical error during auth state change. Clearing session.", error);
          tokenRef.current = null;
          setCurrentUser(null);
          setDbUser(null);
          await signOut(auth);
        }
      } else {
        tokenRef.current = null;
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
    // The onAuthStateChanged listener will automatically handle JIT provisioning.
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

  const switchToBusiness = () => { if (dbUser?.business_profile) setActiveProfile('business'); };
  const switchToPersonal = () => { setActiveProfile('personal'); };

  const hasActiveSubscription = useCallback((plan_id = null) => {
    if (!dbUser) return false;
    // Admins and superusers get elevated privileges
    if (dbUser.role === 'superuser') return true;
    if (dbUser.role === 'admin' && plan_id !== 'ultimate') return true;

    const sub = dbUser.subscription;
    if (!sub || sub.status !== 'active') return false;

    // If just checking for any active subscription
    if (!plan_id) return true;

    // If checking for a specific plan level or higher
    const planHierarchy = { free: 0, premium: 1, ultimate: 2 };
    const userPlanLevel = planHierarchy[sub.plan.id] ?? -1;
    const requiredPlanLevel = planHierarchy[plan_id] ?? -1;

    return userPlanLevel >= requiredPlanLevel;
  }, [dbUser]);

  const value = {
    currentUser,
    dbUser,
    isAuthenticated: !loading && !!currentUser && !!dbUser,
    isAdmin: !loading && (dbUser?.role === 'admin' || dbUser?.role === 'superuser'),
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
      {/*
        [THE DEFINITIVE FIX]
        We DO NOT render the rest of the application until the initial authentication
        check is complete (loading is false). This prevents components from trying
        to make API calls before the auth state and token are definitively known.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
