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
    setupAxiosInterceptors(() => tokenRef.current);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          tokenRef.current = token;
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

  // [THE DEFINITIVE FIX] - This function is now fully resilient to null subscriptions.
  const hasActiveSubscription = useCallback((plan_id = null) => {
    if (!dbUser) return false;
    
    // Admins and superusers get elevated privileges regardless of subscription.
    if (dbUser.role === 'superuser') return true;
    if (dbUser.role === 'admin' && plan_id !== 'ultimate') return true;
    
    const sub = dbUser.subscription;

    // This is the critical check. If `sub` is null (for new users) or not 'active',
    // immediately return false. This prevents the code from ever trying to access
    // properties of a null object.
    if (!sub || sub.status !== 'active') {
        return false;
    }

    // If we reach here, we know `sub` is a valid, active subscription object.
    // If the check is just for *any* active subscription, we can return true.
    if (!plan_id) {
        return true;
    }

    // Now it is safe to check the plan details for tiered access.
    // We add an extra safeguard for `sub.plan` just in case.
    if (!sub.plan) {
        return false;
    }

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
      {!loading && children}
    </AuthContext.Provider>
  );
};
