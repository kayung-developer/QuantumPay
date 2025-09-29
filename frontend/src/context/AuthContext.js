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
  const [loading, setLoading] = useState(true); // Start as true
  const [activeProfile, setActiveProfile] = useState('personal');

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
    // Setup the interceptor ONCE. It will dynamically get the token from the ref.
    setupAxiosInterceptors(() => tokenRef.current);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Don't set loading to true here again, only after the whole process.
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setAuthToken(token); // This updates the ref
          setCurrentUser(user);
          await fetchDbUser();
        } catch (error) {
          console.error("Critical error during auth state change. Clearing session.", error);
          setAuthToken(null);
          setCurrentUser(null);
          setDbUser(null);
          // Don't sign out here, as it might cause loops. Let the flow complete.
        }
      } else {
        setAuthToken(null);
        setCurrentUser(null);
        setDbUser(null);
      }
      // This is the most important part. setLoading(false) only after the first check is complete.
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
  
  const switchToBusiness = () => { if (dbUser?.business_profile) setActiveProfile('business'); };
  const switchToPersonal = () => { setActiveProfile('personal'); };
    
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
    isAuthenticated: !!dbUser, // This is now reliable because of the loading block
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
      {/* 
        [THE DEFINITIVE FIX]
        We DO NOT render the rest of the application until the initial authentication
        check is complete (loading is false). This completely prevents any component
        from mounting and trying to fetch data before the auth state is known and
        the interceptor is properly primed.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
