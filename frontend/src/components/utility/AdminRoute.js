// FILE: src/components/utility/AdminRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const AdminRoute = ({ children }) => {
    const { dbUser, loading, isAdmin } = useAuth();
    const location = useLocation();

    // [THE DEFINITIVE FIX]
    // The same three-state logic is applied here for consistency and robustness.

    // 1. Loading State: Wait for the user's authentication and role to be confirmed.
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-neutral-950">
                <Spinner size="lg" />
            </div>
        );
    }

    // 2. Authenticated & Authorized State: If loading is complete and the user is an admin.
    if (dbUser && isAdmin) {
        return children;
    }

    // 3. Unauthenticated or Unauthorized State: If loading is complete but the user
    // is either not logged in or not an admin, redirect them.
    if (!dbUser) {
        // Not logged in, send to login page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else {
        // Logged in but not an admin, send to the main user dashboard.
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
};

export default AdminRoute;
