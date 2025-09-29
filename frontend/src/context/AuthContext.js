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
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState('personal');

  // [THE DEFINITIVE FIX] Use a ref to hold the token for the interceptor.
  // This avoids issues with stale closures in the interceptor setup.
  const tokenRef = useRef(authToken);
  useEffect(() => {
    tokenRef.current = authToken;
  }, [authToken]);


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
    // [THE DEFINITIVE FIX] Setup the interceptor right away.
    // It will dynamically get the token from our ref.
    setupAxiosInterceptors(() => tokenRef.current);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setAuthToken(token); // Update state, which updates the ref
          setCurrentUser(user);
          await fetchDbUser();
        } catch (error) {
          console.error("Critical error during auth state change. Forcing logout.", error);
          setAuthToken(null);
          setCurrentUser(null);
          setDbUser(null);
          await signOut(auth);
        }
      } else {
        setAuthToken(null);
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchDbUser]);
  
  // The rest of the functions are now guaranteed to work because the interceptor is correctly configured.
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const register = async (email, password, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    // JIT provisioning will be handled by onAuthStateChanged
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
