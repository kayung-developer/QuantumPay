import React, { createContext, useContext, useEffect, useState } from 'react';
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
import { dashboardTourSteps } from '../services/tourService';
import { useAuth } from './AuthContext';

// We need to import the Shepherd CSS for styling
import 'shepherd.js/dist/css/shepherd.css';
import './tourStyles.css'; // Our custom overrides

const TourContext = createContext();

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
  },
  useModalOverlay: true, // This darkens the background
};

export const TourProvider = ({ children }) => {
  const { dbUser, isAuthenticated } = useAuth();
  // State to track if the "new user" tour has been seen
  const [hasSeenTour, setHasSeenTour] = useState(localStorage.getItem('hasSeenDashboardTour') === 'true');

  return (
    <ShepherdTour steps={dashboardTourSteps} tourOptions={tourOptions}>
      <TourManager hasSeenTour={hasSeenTour} setHasSeenTour={setHasSeenTour}>
        {children}
      </TourManager>
    </ShepherdTour>
  );
};

// A helper component to manage the tour logic
const TourManager = ({ children, hasSeenTour, setHasSeenTour }) => {
  const tour = useContext(ShepherdTourContext);
  const { dbUser, isAuthenticated } = useAuth();

  useEffect(() => {
    // This is the core logic to automatically start the tour for new users.
    if (tour && isAuthenticated && dbUser && !hasSeenTour) {
      // We check if the user is "new" (e.g., created in the last 5 minutes)
      const now = new Date();
      const userCreationDate = new Date(dbUser.created_at);
      const fiveMinutes = 5 * 60 * 1000;

      if (now - userCreationDate < fiveMinutes) {
          // Add a small delay to ensure the dashboard elements are rendered
          setTimeout(() => {
              tour.start();
              localStorage.setItem('hasSeenDashboardTour', 'true');
              setHasSeenTour(true);
          }, 1500); // 1.5-second delay
      } else {
        // If the user is old but localStorage flag is missing, set it.
        localStorage.setItem('hasSeenDashboardTour', 'true');
        setHasSeenTour(true);
      }
    }
  }, [tour, isAuthenticated, dbUser, hasSeenTour, setHasSeenTour]);

  return children;
};

// Custom hook to access the tour controls from any component
export const useTour = () => useContext(ShepherdTourContext);