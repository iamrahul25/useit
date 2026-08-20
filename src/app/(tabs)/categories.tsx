import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ItemCategory, Item } from '@/types/item';
import { getItems } from '@/utils/storage';

const CATEGORIES: { label: ItemCategory; emoji: string; bg: string }[] = [
  { label: 'Dairy', emoji: '🥛', bg: '#E0F2FE' },
  { label: 'Vegetables', emoji: '🥦', bg: '#DCFCE7' },
  { label: 'Fruits', emoji: '🍎', bg: '#FEE2E2' },
  { label: 'Snacks', emoji: '🥜', bg: '#FEF3C7' },
  { label: 'Bakery', emoji: '🍞', bg: '#FFEDD5' },
  { label: 'Beverages', emoji: '🧃', bg: '#F3E8FF' },
  { label: 'Meat & Seafood', emoji: '🥩', bg: '#FFE4E6' },
  { label: 'Medicine', emoji: '💊', bg: '#E0E7FF' },
  { label: 'Other', emoji: '📦', bg: '#F3F4F6' },
];

export default function CategoriesScreen() {
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

  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.label] || 0;

          return (
            <TouchableOpacity
              key={cat.label}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/', params: { category: cat.label } })}
              style={styles.categoryCard}>
              <View style={[styles.emojiBox, { backgroundColor: cat.bg }]}>
                <Text style={styles.emojiText}>{cat.emoji}</Text>
              </View>

              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <Text style={styles.countText}>{count} items</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
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
  gridContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  emojiBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiText: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
