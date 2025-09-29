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
import apiClient from '../api/axiosConfig'; // Import your configured axios instance
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [authToken, setAuthToken] = useState(null); // <-- NEW: State to hold the token
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState('personal'); 

  // fetchDbUser remains the same but will now be called AFTER the token is set.
  const fetchDbUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me');
      setDbUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch DB user:", error);
      await signOut(auth); // Force logout on critical failure
      return null;
    }
  }, []);

  // [THE DEFINITIVE FIX - PART 1: CONTEXT REFACTOR]
  // This useEffect is the core of the fix.
  // It listens for Firebase auth changes, gets the token, sets the API client header,
  // and THEN fetches our backend user, all in the correct sequence.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // 1. Get the all-important ID token from Firebase.
          const token = await user.getIdToken(true); // `true` forces a refresh if needed
          setAuthToken(token); // <-- NEW: Set the token in our state

          // 2. [CRITICAL] Set this token as a default header for all future axios requests.
          // This ensures every subsequent call from any part of the app is authenticated.
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 3. NOW that authentication is established, fetch our internal user data.
          await fetchDbUser();

        } catch (error) {
            console.error("Error during auth state change handling:", error);
            // If token fetching or db user fetch fails, force logout.
            await signOut(auth);
            setAuthToken(null);
            apiClient.defaults.headers.common['Authorization'] = null;
        }
      } else {
        // No user is signed in, clear everything.
        setCurrentUser(null);
        setDbUser(null);
        setAuthToken(null);
        // [CRITICAL] Clear the authorization header on logout.
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchDbUser]);


  const login = async (email, password) => {
    const toastId = toast.loading('Logging in...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest.
      toast.success('Login successful!', { id: toastId });
    } catch (error) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password.' 
        : error.message;
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  const register = async (email, password, fullName, country_code, phone_number) => {
    const toastId = toast.loading('Creating your account...');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });

      const token = await user.getIdToken();
      await apiClient.post('/auth/complete-registration',
          {
              firebase_uid: user.uid, email, full_name: fullName, country_code, phone_number,
          },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      // The onAuthStateChanged listener will handle the final login state
      toast.success('Registration successful! Welcome.', { id: toastId });

    } catch (error) {
        // [THE FIX] Check for the specific network error code here as well
        if (error.code === 'auth/network-request-failed') {
            toast.error('Could not connect. Please check your internet connection.', { id: toastId });
        } else if (error.code === 'auth/email-already-in-use') {
             toast.error('This email address is already registered.', { id: toastId });
        } else {
            toast.error(error.response?.data?.detail || error.message, { id: toastId });
        }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('You have been logged out..');
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

    const hasActiveSubscription = (plan_id = null) => {
      const sub = dbUser?.subscription;
      if (!sub || sub.status !== 'active') return false;
      if (plan_id) {
          // Check for a specific plan or higher
          const planHierarchy = { free: 0, premium: 1, ultimate: 2 };
          return planHierarchy[sub.plan.id] >= planHierarchy[plan_id];
      }
      return true;
  };

  const value = {
    currentUser,
    dbUser,
    authToken,
    isAuthenticated: !!dbUser, // User is authenticated only if we have their details from our DB
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
    subscription: dbUser?.subscription,
    hasActiveSubscription,
  };

  return (
        <AuthContext.Provider value={value}>
                {children}
        </AuthContext.Provider>
    );
};