import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * [V5.4 - REAL SYSTEM IMPLEMENTATION]
 * A centralized service for triggering haptic feedback.
 * This provides a consistent way to add a native feel to the app
 * and can be disabled globally (e.g., in user settings) if needed.
 */
class HapticsService {
    // A light tap, great for button presses or toggling switches.
    light(): void {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }

    // A medium tap, good for confirming a selection.
    medium(): void {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }

    // A heavy tap, for significant actions like completing a transaction.
    heavy(): void {
         if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    }

    // A notification-style feedback.
    // 'success' gives a quick double-tap.
    // 'warning' gives a stuttered vibration.
    // 'error' gives a longer, more noticeable buzz.
    notify(type: 'success' | 'warning' | 'error'): void {
        if (Platform.OS !== 'web') {
            let notificationType: Haptics.NotificationFeedbackType;
            switch (type) {
                case 'success':
                    notificationType = Haptics.NotificationFeedbackType.Success;
                    break;
                case 'warning':
                    notificationType = Haptics.NotificationFeedbackType.Warning;
                    break;
                case 'error':
                    notificationType = Haptics.NotificationFeedbackType.Error;
                    break;
                default:
                    notificationType = Haptics.NotificationFeedbackType.Success;
            }
            Haptics.notificationAsync(notificationType);
        }
    }
}

// Export a singleton instance so we don't need to create a new one everywhere.
export const haptics = new HapticsService();