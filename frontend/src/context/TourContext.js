import React, { createContext, useContext, useEffect, useCallback } from 'react';
// [THE FIX] Import the components that are correct for version 4.2.0
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
import { dashboardTourSteps } from '../services/tourService';
import { useAuth } from './AuthContext';
import 'shepherd.js/dist/css/shepherd.css';
import './tourStyles.css';

// 1. Create our custom context to provide simplified controls
const CustomTourContext = createContext({
  startDashboardTour: () => {},
});

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
  },
  useModalOverlay: true,
};

// 2. The main provider component
export const TourProvider = ({ children }) => {
  return (
    // [THE FIX] The ShepherdTour component is used again, and it takes the steps and options as props.
    <ShepherdTour steps={dashboardTourSteps} tourOptions={tourOptions}>
      <TourManager>
        {children}
      </TourManager>
    </ShepherdTour>
  );
};

// 3. The logic manager component
const TourManager = ({ children }) => {
  // [THE FIX] Get the tour instance using the correct ShepherdTourContext.
  const tour = useContext(ShepherdTourContext);
  const { dbUser, isAuthenticated, loading: authLoading } = useAuth();
  
  const startDashboardTour = useCallback(() => {
    // The instance from this context has the .start() method.
    if (tour && tour.start) {
      console.log("Manual tour start requested.");
      tour.start();
    } else {
       console.error("Tour instance not available to start.");
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
      console.log("New user detected, launching tour.");
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
};

// 4. The custom hook our components use remains unchanged.
export const useTour = () => useContext(CustomTourContext);
