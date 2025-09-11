import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Spinner from '../common/Spinner';

/**
 * A wrapper for routes that require administrative privileges.
 * This component should be wrapped by ProtectedRoute in the router setup,
 * or it can wrap ProtectedRoute itself for a chained check.
 * It checks if the authenticated user has an 'admin' or 'superuser' role.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The admin component/page to render.
 * @returns {React.ReactElement} The protected admin component or a redirect.
 */
const AdminRoute = ({ children }) => {
  const { dbUser, loading, isAdmin } = useAuth();

  // The 'loading' state here refers to the overall auth process, including fetching dbUser.
  // It's crucial to wait for dbUser to be populated before checking the admin role.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // We first ensure there is a user (this check is implicitly handled by ProtectedRoute,
  // but it's good practice to be explicit). If there is a user, we then check their role.
  // The `isAdmin` flag in AuthContext already checks for 'admin' or 'superuser'.
  if (!isAdmin) {
    // User is logged in but not an admin. Redirect them to their dashboard.
    // This is a more user-friendly experience than showing a generic "Unauthorized" page.
    return <Navigate to="/dashboard" replace />;
  }
  
  // If all checks pass, render the requested admin page.
  return children;
};


// A more robust pattern is to compose the routes directly, which we've done in App.js.
// However, creating this component makes the route definition cleaner.
// For example: <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
// This will first check for login (via ProtectedRoute logic if needed), then check for admin role.

// The implementation in our App.js already uses <ProtectedRoute> and then this <AdminRoute>,
// which is a perfectly valid and secure pattern. The logic inside ProtectedRoute runs first.
// Let's refine AdminRoute to be fully self-contained for clarity.

const FullAdminRoute = ({ children }) => {
  return (
    <ProtectedRoute>
        {/* The child component will only render if ProtectedRoute allows it */}
        <AdminLogic>
            {children}
        </AdminLogic>
    </ProtectedRoute>
  )
}

const AdminLogic = ({ children }) => {
    const { dbUser, loading, isAdmin } = useAuth();
    
    // By the time this component renders, we know a `currentUser` exists.
    // We just need to wait for `dbUser` to be fetched.
    if (loading || !dbUser) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
                <Spinner size="lg" />
            </div>
        );
    }
    
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


// We will use the more direct `AdminRoute` component for simplicity in our `App.js` setup.
// The logic is sound as `loading` in `useAuth` covers both Firebase auth and DB user fetching.
export default AdminRoute;