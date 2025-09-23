import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase'; // Assuming your firebase config is in 'src/firebase.js'
import apiClient, { setupAxiosInterceptors } from '../api/axiosConfig'; // Import your configured axios instance
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
   const [activeProfile, setActiveProfile] = useState('personal'); // 'personal' or 'business'

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
    const toastId = toast.loading('Logging in...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!', { id: toastId });
    } catch (error) {
      // [THE FIX] Check for the specific network error code
      if (error.code === 'auth/network-request-failed') {
        toast.error('Could not connect. Please check your internet connection.', { id: toastId });
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. Please try again.', { id: toastId });
      } else {
        toast.error(error.message, { id: toastId });
      }
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
    activeProfile,
    switchToBusiness,
    switchToPersonal,
  };

  return (
        <AuthContext.Provider value={value}>
                {children}
        </AuthContext.Provider>
    );
};
