import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd';
import { dashboardTourSteps } from '../services/tourService';
import { useAuth } from './AuthContext';
import 'shepherd.js/dist/css/shepherd.css';
import './tourStyles.css';

// 1. Create the context. It will hold the start function.
const TourContext = createContext({
  startDashboardTour: () => {},
});

// 2. The main provider component that will be wrapped around our app.
export const TourProvider = ({ children }) => {
  return (
    // The library's provider handles the tour instance.
    <ShepherdJourneyProvider steps={dashboardTourSteps} tourOptions={tourOptions}>
      {/* Our custom logic component is now inside, and it provides the context value. */}
      <TourLogicProvider>
        {children}
      </TourLogicProvider>
    </ShepherdJourneyProvider>
  );
};

// This is an internal component that can access the Shepherd context
// and provide our simplified functions to the rest of the app.
const TourLogicProvider = ({ children }) => {
  const tour = useShepherd(); // This hook now works because it's inside ShepherdJourneyProvider
  const { dbUser, isAuthenticated, loading: authLoading } = useAuth();

  const startDashboardTour = useCallback(() => {
    if (tour && tour.start) {
      console.log("Manual tour start requested."); // Add a log for debugging
      tour.start();
    } else {
      console.error("Tour instance not available to start."); // Add an error log
    }
  }, [tour]);

  // This effect handles the automatic tour for new users.
  useEffect(() => {
    if (authLoading || !isAuthenticated || !dbUser) {
      return;
    }

    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour_v1');
    if (hasSeenTour) {
      return;
    }

    const now = new Date();
    const userCreationDate = new Date(dbUser.created_at);
    const fiveMinutes = 5 * 60 * 1000;
    const isNewUser = (now - userCreationDate) < fiveMinutes;

    if (isNewUser) {
      console.log("New user detected, auto-starting tour.");
      const timer = setTimeout(() => {
        startDashboardTour();
        localStorage.setItem('hasSeenDashboardTour_v1', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
        localStorage.setItem('hasSeenDashboardTour_v1', 'true');
    }
  }, [isAuthenticated, dbUser, authLoading, startDashboardTour]);

  // Provide our custom start function to all children.
  return (
    <TourContext.Provider value={{ startDashboardTour }}>
      {children}
    </TourContext.Provider>
  );
}

// 3. The custom hook our components will use. This remains the same.
export const useTour = () => useContext(TourContext);

// We keep the tourOptions here for clarity.
const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
  },
  useModalOverlay: true,
};