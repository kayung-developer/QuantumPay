// FILE: src/components/utility/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You would log this to an external service like Sentry or LogRocket
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-neutral-950 p-4 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Something went wrong.</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        We've been notified of the issue. Please refresh the page to try again.
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;