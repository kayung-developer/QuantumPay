import React, { createContext, useContext, useEffect, useCallback } from 'react';
// [THE FIX] Import the correct, modern components and hooks
import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd';
import { dashboardTourSteps } from '../services/tourService';
import { useAuth } from './AuthContext';
import 'shepherd.js/dist/css/shepherd.css';
import './tourStyles.css';

// Create a custom context to provide our simplified `startDashboardTour` function.
const CustomTourContext = createContext({
  startDashboardTour: () => {},
});

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    // classes are now passed here in the modern API
    classes: 'shepherd-element shepherd-theme-arrows',
    scrollTo: true,
  },
  useModalOverlay: true,
};

// The main provider component. It now correctly uses ShepherdJourneyProvider.
export const TourProvider = ({ children }) => {
  return (
    // The provider now takes the steps and options directly as props.
    <ShepherdJourneyProvider steps={dashboardTourSteps} tourOptions={tourOptions}>
      <TourLogicProvider>
        {children}
      </TourLogicProvider>
    </ShepherdJourneyProvider>
  );
};

// This internal component correctly accesses the context.
const TourLogicProvider = ({ children }) => {
  const tour = useShepherd(); // Get the tour instance using the correct hook.
  const { dbUser, isAuthenticated, loading: authLoading } = useAuth();

  const startDashboardTour = useCallback(() => {
    // The `tour` object from `useShepherd` is the tour instance itself.
    if (tour && tour.start) {
      console.log("Starting guided tour...");
      tour.start();
    } else {
      console.error("Tour instance not available from useShepherd hook.");
    }
  }, [tour]);

  // This effect for auto-starting the tour remains the same.
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
      const timer = setTimeout(() => {
        startDashboardTour();
        localStorage.setItem('hasSeenDashboardTour_v1', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
        localStorage.setItem('hasSeenDashboardTour_v1', 'true');
    }
  }, [isAuthenticated, dbUser, authLoading, startDashboardTour]);
  
  return (
    <CustomTourContext.Provider value={{ startDashboardTour }}>
      {children}
    </CustomTourContext.Provider>
  );
}

// The custom hook our components will use.
export const useTour = () => useContext(CustomTourContext);
