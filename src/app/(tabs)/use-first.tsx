import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Item, ExpiryGroup, ExpiryStatus } from '@/types/item';
import { getItems, deleteItem } from '@/utils/storage';
import { getDaysUntilExpiry, getExpiryStatus } from '@/utils/dateUtils';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';

export default function UseFirstScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getItems();
    setItems(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleMarkAsUsed = (item: Item) => {
    Alert.alert(
      'Mark as Used',
      `Did you use or consume "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Consumed! 🎉',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            await loadData();
          },
        },
      ]
    );
  };

  // Sort items strictly by earliest expiry date
  const sortedItems = [...items].sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.expiryDate);
    const daysB = getDaysUntilExpiry(b.expiryDate);
    return daysA - daysB;
  });

  // Group items by urgency status
  const groupsMap: Record<ExpiryStatus, Item[]> = {
    expired: [],
    urgent: [],
    soon: [],
    fresh: [],
  };

  sortedItems.forEach((item) => {
    const status = getExpiryStatus(item.expiryDate);
    groupsMap[status].push(item);
  });

  const sections: { title: string; subtitle: string; status: ExpiryStatus; data: Item[] }[] = [];

  if (groupsMap.expired.length > 0) {
    sections.push({
      title: '🔴 Expired / Expires Today',
      subtitle: 'Consume or dispose immediately!',
      status: 'expired',
      data: groupsMap.expired,
    });
  }

  if (groupsMap.urgent.length > 0) {
    sections.push({
      title: '🟠 Urgent (Expires in 1–2 Days)',
      subtitle: 'Plan your meals around these next',
      status: 'urgent',
      data: groupsMap.urgent,
    });
  }

  if (groupsMap.soon.length > 0) {
    sections.push({
      title: '🟡 Soon (Expires in 3–7 Days)',
      subtitle: 'Use these in upcoming days',
      status: 'soon',
      data: groupsMap.soon,
    });
  }

  if (groupsMap.fresh.length > 0) {
    sections.push({
      title: '🟢 Fresh (More than 7 Days Remaining)',
      subtitle: 'Good condition for now',
      status: 'fresh',
      data: groupsMap.fresh,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.badgeText}>DECISION ASSISTANT</Text>
          <Text style={styles.title}>Use First Timeline</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/add-item')}
          style={styles.headerAddBtn}>
          <Ionicons name="camera-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerDesc}>
        Items auto-sorted by closest expiry date. Focus on top items first to prevent food waste!
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title, subtitle } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <ItemCard item={item} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleMarkAsUsed(item)}
              style={styles.useButton}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#166534" />
              <Text style={styles.useButtonText}>Used / Consumed</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<EmptyState message="No items to sort. Add items to see your Use First timeline!" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerAddBtn: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerDesc: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemWrapper: {
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    marginHorizontal: 12,
    marginTop: -4,
    marginBottom: 4,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  useButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
});
