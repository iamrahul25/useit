import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '@/types/item';
import { getItems } from '@/utils/storage';
import { formatDisplayDate, getDaysLeftLabel, getExpiryStatus } from '@/utils/dateUtils';

export default function RemindersScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  const loadData = async () => {
    const data = await getItems();
    setItems(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Filter items expiring soon (e.g. status urgent, soon, or expired)
  const expiringSoonItems = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    return status === 'expired' || status === 'urgent' || status === 'soon';
  });

  const spotlightItem = expiringSoonItems[0] || items[0];

  const handleRemindMe = (item: Item) => {
    Alert.alert(
      'Reminder Set 🔔',
      `You will receive push reminders before "${item.name}" expires on ${formatDisplayDate(item.expiryDate)}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen 3 Top Visual — Mobile Lock Screen Notification Preview */}
        <View style={styles.lockScreenContainer}>
          <View style={styles.lockScreenHeader}>
            <Text style={styles.lockScreenTime}>9:30</Text>
            <Text style={styles.lockScreenDate}>Tuesday, 20 Aug</Text>
          </View>

          {spotlightItem ? (
            <View style={styles.pushNotificationCard}>
              <View style={styles.notifHeaderRow}>
                <View style={styles.appIconBadge}>
                  <Text style={styles.appIconEmoji}>🥑</Text>
                </View>
                <Text style={styles.appNameText}>Food Reminder</Text>
                <Text style={styles.nowText}>• now</Text>
              </View>

              <View style={styles.notifBodyRow}>
                <View style={styles.notifTextColumn}>
                  <Text style={styles.notifHeading}>Item about to expire!</Text>
                  <Text style={styles.notifMessage}>
                    "{spotlightItem.name}" expires on {formatDisplayDate(spotlightItem.expiryDate)} ({getDaysLeftLabel(spotlightItem.expiryDate)}). Use it before it expires.
                  </Text>
                </View>

                {spotlightItem.imageUri ? (
                  <Image source={{ uri: spotlightItem.imageUri }} style={styles.notifThumbnail} contentFit="cover" />
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.emptyNotifCard}>
              <Text style={styles.emptyNotifText}>No upcoming expiry reminders.</Text>
            </View>
          )}
        </View>

        {/* Expiring Soon List Section */}
        <View style={styles.expiringSoonSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Expiring Soon ({expiringSoonItems.length})
            </Text>
          </View>

          {expiringSoonItems.map((item) => {
            const status = getExpiryStatus(item.expiryDate);
            const daysLabel = getDaysLeftLabel(item.expiryDate);
            const isUrgent = status === 'expired' || status === 'urgent';

            return (
              <View key={item.id} style={styles.itemRowCard}>
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.itemThumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.itemThumbnail, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                  </View>
                )}

                <View style={styles.itemDetails}>
                  <Text style={styles.itemNameText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemExpiryText}>
                    Expires on {formatDisplayDate(item.expiryDate)}
                  </Text>
                  <Text style={[styles.itemDaysText, isUrgent ? styles.textDanger : styles.textWarning]}>
                    {daysLabel}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleRemindMe(item)}
                  style={styles.remindButton}>
                  <Ionicons name="notifications-outline" size={16} color="#16A34A" />
                  <Text style={styles.remindButtonText}>Remind me</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity onPress={() => router.push('/')} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Items</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827', // Dark lock screen top
  },
  scrollContent: {
    paddingBottom: 40,
  },
  lockScreenContainer: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  lockScreenHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lockScreenTime: {
    fontSize: 54,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  lockScreenDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 2,
  },
  pushNotificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  appIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconEmoji: {
    fontSize: 12,
  },
  appNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  nowText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notifBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notifTextColumn: {
    flex: 1,
  },
  notifHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  notifThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  emptyNotifCard: {
    padding: 20,
  },
  emptyNotifText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  expiringSoonSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    minHeight: 400,
    marginTop: -10,
  },
  sectionHeaderRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  itemExpiryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemDaysText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  textDanger: {
    color: '#EF4444',
  },
  textWarning: {
    color: '#F59E0B',
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  remindButtonText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  viewAllButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '700',
  },
});
