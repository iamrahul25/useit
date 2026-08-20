import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Item, CategoryFilterType } from '@/types/item';
import { getItems } from '@/utils/storage';
import { getExpiryStatus } from '@/utils/dateUtils';
import { Header } from '@/components/Header';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('All');

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter items by category and search text
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate stats for Header and Urgent spotlight
  const urgentCount = items.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    return status === 'expired' || status === 'urgent';
  }).length;

  const expiredOrTodayItems = items.filter(
    (item) => getExpiryStatus(item.expiryDate) === 'expired'
  );
  const urgentItems = items.filter(
    (item) => getExpiryStatus(item.expiryDate) === 'urgent'
  );
  const soonItems = items.filter(
    (item) => getExpiryStatus(item.expiryDate) === 'soon'
  );

  // Calculate category counts
  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc['All'] = (acc['All'] || 0) + 1;
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header totalItems={items.length} expiringSoonCount={urgentCount} />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Search Input Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search food, medicines, produce..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Expiring Soon Spotlight Banner */}
            {(expiredOrTodayItems.length > 0 || urgentItems.length > 0) && (
              <View style={styles.spotlightContainer}>
                <View style={styles.spotlightHeader}>
                  <Text style={styles.spotlightTitle}>⚡ Expiring Soon Spotlight</Text>
                  <TouchableOpacity onPress={() => router.push('/use-first')}>
                    <Text style={styles.viewAllText}>View All →</Text>
                  </TouchableOpacity>
                </View>

                {expiredOrTodayItems.length > 0 && (
                  <View style={[styles.urgencySection, styles.expiredSection]}>
                    <Text style={styles.urgencyTitle}>🔴 Expires Today / Expired</Text>
                    {expiredOrTodayItems.slice(0, 2).map((item) => (
                      <ItemCard key={`spotlight_${item.id}`} item={item} compact />
                    ))}
                  </View>
                )}

                {urgentItems.length > 0 && (
                  <View style={[styles.urgencySection, styles.urgentSection]}>
                    <Text style={styles.urgencyTitle}>🟠 Expires in 1–2 Days</Text>
                    {urgentItems.slice(0, 2).map((item) => (
                      <ItemCard key={`spotlight_${item.id}`} item={item} compact />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Category Filter Chips */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Visual Catalog</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
            />
          </View>
        }
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={
          <EmptyState
            categoryFilter={selectedCategory}
            message={
              searchQuery
                ? `No items matching "${searchQuery}"`
                : undefined
            }
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/add-item')}
        style={styles.fabButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Item</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  spotlightContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spotlightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  urgencySection: {
    marginBottom: 8,
  },
  expiredSection: {},
  urgentSection: {},
  urgencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    gap: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
