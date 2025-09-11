import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import useCachedResources from './src/hooks/useCachedResources';
import ErrorBoundary from 'react-native-error-boundary'; // <-- NEW IMPORT
import ErrorFallbackScreen from './src/screens/utility/ErrorFallbackScreen'; // <-- NEW IMPORT
import { MobileTourProvider } from './src/context/MobileTourProvider';
import { LogBox } from 'react-native';

// It's common for some libraries to have warnings we can't fix.
// This is a way to ignore specific, non-critical warnings in production.
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const App = () => {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <>
        <RootNavigator />
        <StatusBar style="light" />
      </>
    );
  }
}

// [THE IMPLEMENTATION]
// Export a new root component that wraps our App in the ErrorBoundary
const AppWrapper = () => {
    const errorHandler = (error: Error, stackTrace: string) => {
        // In a real production app, you would log this error to a service
        // like Sentry, Bugsnag, or Firebase Crashlytics.
        console.error("Caught global error:", error);
        console.error("Stack trace:", stackTrace);
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallbackScreen} onError={errorHandler}>
            <MobileTourProvider> {/* <-- WRAP THE APP */}
                <App />
            </MobileTourProvider>
        </ErrorBoundary>
    );
};

export default AppWrapper;