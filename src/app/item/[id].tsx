import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '@/types/item';
import { getItems, deleteItem } from '@/utils/storage';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDisplayDate, getExpiryStatus, getStatusTheme } from '@/utils/dateUtils';
import { confirmDialog } from '@/utils/alertUtils';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      if (!id) return;
      const allItems = await getItems();
      const found = allItems.find((i) => i.id === id);
      setItem(found || null);
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  const handleMarkAsUsed = () => {
    if (!item) return;

    confirmDialog(
      'Mark as Used',
      `Mark "${item.name}" as consumed or used?`,
      async () => {
        await deleteItem(item.id);
        router.back();
      },
      'Consumed! 🎉',
      true
    );
  };

  const handleDelete = () => {
    if (!item) return;

    confirmDialog(
      'Delete Item',
      `Are you sure you want to delete "${item.name}" from your catalog?`,
      async () => {
        await deleteItem(item.id);
        router.back();
      },
      'Delete',
      true
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getExpiryStatus(item.expiryDate);
  const theme = getStatusTheme(status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Full Image Banner */}
        <View style={styles.imageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.bg }]}>
              <Text style={styles.placeholderEmoji}>
                {item.category === 'Food'
                  ? '🥛'
                  : item.category === 'Medicine'
                  ? '💊'
                  : item.category === 'Produce'
                  ? '🍎'
                  : item.category === 'Cosmetics'
                  ? '🧴'
                  : item.category === 'Supplements'
                  ? '🌿'
                  : '📦'}
              </Text>
            </View>
          )}

          <View style={styles.badgeOverlay}>
            <StatusBadge expiryDate={item.expiryDate} size="large" />
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            {item.quantity ? <Text style={styles.quantityText}>Qty: {item.quantity}</Text> : null}
          </View>

          {/* Details Breakdown */}
          <View style={styles.detailsGroup}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
              <View>
                <Text style={styles.detailLabel}>EXPIRY DATE</Text>
                <Text style={styles.detailValue}>{formatDisplayDate(item.expiryDate)}</Text>
              </View>
            </View>

            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#0D9488" />
                <View>
                  <Text style={styles.detailLabel}>STORAGE LOCATION</Text>
                  <Text style={styles.detailValue}>{item.location}</Text>
                </View>
              </View>
            )}

            {item.notes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color="#D97706" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>NOTES</Text>
                  <Text style={styles.detailValue}>{item.notes}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <View>
                <Text style={styles.detailLabel}>ADDED TO CATALOG</Text>
                <Text style={styles.detailValue}>{formatDisplayDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleMarkAsUsed}
            style={styles.usedButton}>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.usedButtonText}>Mark as Used / Consumed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={styles.deleteButtonText}>Delete Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 260,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  quantityText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  detailsGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  usedButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  usedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 6,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
