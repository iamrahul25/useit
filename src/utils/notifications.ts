import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Item } from '@/types/item';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

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
  if (Platform.OS === 'web') return;

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
        trigger: { date: dayBefore } as any,
      });
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
        trigger: { date: dayOfExpiry } as any,
      });
    }
  } catch (error) {
    console.warn('Error scheduling notification:', error);
  }
}

export async function cancelItemReminders(itemId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.itemId === itemId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (error) {
    console.warn('Error cancelling notification:', error);
  }
}
