import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendTestNotification } from '@/utils/notifications';

export default function MoreScreen() {
  const router = useRouter();

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Options</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>APP SETTINGS</Text>

          <TouchableOpacity style={styles.rowItem}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <Text style={styles.rowLabel}>Notification Lead Time (1-7 days)</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <Ionicons name="camera-outline" size={20} color="#374151" />
            <Text style={styles.rowLabel}>Default Camera Aspect Ratio</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS & TESTING</Text>

          <TouchableOpacity onPress={handleTestNotification} style={styles.rowItem}>
            <Ionicons name="notifications-circle-outline" size={22} color="#16A34A" />
            <Text style={[styles.rowLabel, { color: '#16A34A', fontWeight: '700' }]}>
              Test Notification
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Food Expiry Reminder</Text>
          <Text style={styles.appVersion}>Version 1.0.0 • Clean & Premium UI</Text>
          <Text style={styles.tagline}>Take photo → Add expiry date → Save → Get reminded</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  aboutCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  appVersion: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 8,
  },
});
