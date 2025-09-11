import React, { createContext, useContext, useEffect, useState } from 'react';
import { SpotlightTourProvider, TourStep } from 'react-native-spotlight-tour';
import { homeScreenTourSteps } from '../services/mobileTourService';
import { useAppStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our context
interface TourContextType {
    startTour: (steps: TourStep[]) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const MobileTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { dbUser } = useAppStore();
    const [start, setStart] = useState(false);
    const [steps, setSteps] = useState<TourStep[]>([]);

    // Logic to automatically start the tour for new users
    useEffect(() => {
        const checkAndStartTour = async () => {
            if (!dbUser) return;

            const hasSeenTour = await AsyncStorage.getItem('hasSeenMobileTour');
            if (hasSeenTour) return;

            // Check if the user is "new" (e.g., created in the last 5 minutes)
            const now = new Date();
            const userCreationDate = new Date(dbUser.created_at); // Assuming `created_at` is on dbUser
            const fiveMinutes = 5 * 60 * 1000;

            if (now.getTime() - userCreationDate.getTime() < fiveMinutes) {
                 // Wait for the UI to be ready before starting the tour
                setTimeout(() => {
                    startTour(homeScreenTourSteps);
                    AsyncStorage.setItem('hasSeenMobileTour', 'true');
                }, 2000); // 2-second delay
            } else {
                // If the user is old but the flag is missing, just set the flag
                AsyncStorage.setItem('hasSeenMobileTour', 'true');
            }
        };

        checkAndStartTour();
    }, [dbUser]);

    const startTour = (tourSteps: TourStep[]) => {
        setSteps(tourSteps);
        setStart(true);
    };

    return (
        <TourContext.Provider value={{ startTour }}>
            <SpotlightTourProvider
                steps={steps}
                start={start}
                onStop={() => setStart(false)}
                overlayColor="rgba(2, 6, 23, 0.85)" // neutral-950 with opacity
                tooltipStyle={{ backgroundColor: '#1E293B', borderRadius: 12 }}
                textStyle={{ color: '#E2E8F0' }}
                titleStyle={{ color: 'white', fontWeight: 'bold' }}
            >
                {children}
            </SpotlightTourProvider>
        </TourContext.Provider>
    );
};

// Custom hook to access the tour controls from any component
export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};