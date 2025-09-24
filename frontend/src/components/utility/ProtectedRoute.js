// FILE: src/components/utility/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children }) => {
    const { dbUser, loading } = useAuth();
    const location = useLocation();

    // [THE DEFINITIVE FIX]
    // The component now handles all three possible states to prevent race conditions.

    // 1. Loading State: While the AuthContext is verifying the user, show a full-page spinner.
    // This is the crucial step that prevents the blank page.
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-neutral-950">
                <Spinner size="lg" />
            </div>
        );
    }

    // 2. Unauthenticated State: Once loading is false, if there is still no user,
    // redirect them to the login page.
    if (!dbUser) {
        // We also pass the original location they were trying to access,
        // so we can redirect them back after a successful login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authenticated State: If loading is false and we have a user, render the requested page.
    return children;
};

export default ProtectedRoute;
