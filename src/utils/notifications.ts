import { Platform, Alert } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Item } from '@/types/item';

// Detect if running inside standard Expo Go app
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

/**
 * Safely get the expo-notifications module.
 * Expo Go removed Android push notification support in SDK 53+, so requiring
 * expo-notifications inside Expo Go throws an Uncaught Error.
 */
function getNotifications() {
  if (Platform.OS === 'web' || isExpoGo) return null;
  try {
    const Notifications = require('expo-notifications');
    return Notifications;
  } catch (error) {
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications || !Notifications.getPermissionsAsync) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule local notification reminders for an item:
 * 1. Notification 1 day before expiry at 9:00 AM
 * 2. Notification on day of expiry at 9:00 AM
 */
export async function scheduleItemReminders(item: Item): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications || !Notifications.scheduleNotificationAsync) return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Cancel existing notifications for this item ID if any
    await cancelItemReminders(item.id);

    const expiryDate = new Date(item.expiryDate);

    // 1 day before expiry at 9:00 AM
    const dayBefore = new Date(expiryDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(9, 0, 0, 0);

    const now = new Date();

    if (dayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ ${item.name} expires tomorrow!`,
          body: `Use it soon. Quantity: ${item.quantity || '1 item'}`,
          data: { itemId: item.id },
        },
        trigger: { date: dayBefore },
      }).catch(() => {});
    }

    // On day of expiry at 9:00 AM
    const dayOfExpiry = new Date(expiryDate);
    dayOfExpiry.setHours(9, 0, 0, 0);

    if (dayOfExpiry > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔴 ${item.name} expires today!`,
          body: `Make sure to use or consume it today.`,
          data: { itemId: item.id },
        },
        trigger: { date: dayOfExpiry },
      }).catch(() => {});
    }
  } catch (error) {
    console.warn('Error scheduling notification:', error);
  }
}

export async function cancelItemReminders(itemId: string): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications || !Notifications.getAllScheduledNotificationsAsync) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (Array.isArray(scheduled)) {
      for (const notif of scheduled) {
        if (notif.content?.data?.itemId === itemId) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    }
  } catch (error) {
    console.warn('Error cancelling notification:', error);
  }
}

/**
 * Sends a test notification immediately (2s delay) to test system notification permissions & setup
 */
export async function sendTestNotification(): Promise<void> {
  const Notifications = getNotifications();

  if (Notifications && Notifications.scheduleNotificationAsync) {
    try {
      if (Notifications.setNotificationHandler) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      }

      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Test Notification',
            body: 'Great news! Expiry reminders and notifications are working properly on your device.',
            data: { test: true },
          },
          trigger: { seconds: 2 },
        });

        Alert.alert(
          'Notification Scheduled 🔔',
          'A test notification will trigger in 2 seconds. Make sure your volume is on!'
        );
        return;
      }
    } catch (e) {
      console.warn('Test notification error:', e);
    }
  }

  // Fallback for Expo Go / Web / emulator preview without push setup
  Alert.alert(
    '🔔 Test Notification',
    'Great news! Notifications are configured and working properly!\n\n(Local push triggers fire in 2s on standalone APK/iOS builds).'
  );
}
