import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

/**
 * A wrapper for routes that require user authentication.
 * It checks the auth state and redirects to the login page if the user is not authenticated.
 * It also handles the initial loading state gracefully.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The component/page to render if the user is authenticated.
 * @returns {React.ReactElement} The protected component or a redirect.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Handle the initial loading state from AuthContext
  // This prevents a redirect to /login before Firebase has initialized.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }

  // 2. If loading is finished and there's no user, redirect to login
  // We pass the original location in the state. This allows us to redirect the
  // user back to the page they were trying to access after they log in.
  if (!isAuthenticated) { // Check the boolean
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If loading is finished and there is a user, render the child component
  return children;
};

export default ProtectedRoute;