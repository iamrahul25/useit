import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Item, CategoryFilterType, ItemTabStatus } from '@/types/item';
import { getItems, deleteItem } from '@/utils/storage';
import { confirmDialog } from '@/utils/alertUtils';
import { getDaysUntilExpiry } from '@/utils/dateUtils';
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
  const [selectedTab, setSelectedTab] = useState<ItemTabStatus>('active');

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

  // Group items by status
  const activeItems = items.filter((item) => !item.isConsumed && getDaysUntilExpiry(item.expiryDate) > 0);
  const expiredItems = items.filter((item) => !item.isConsumed && getDaysUntilExpiry(item.expiryDate) <= 0);
  const consumedItems = items.filter((item) => item.isConsumed);

  const targetTabItems =
    selectedTab === 'active'
      ? activeItems
      : selectedTab === 'expired'
      ? expiredItems
      : consumedItems;

  // Filter items by category and search text
  const filteredItems = targetTabItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate category counts for current tab
  const categoryCounts = targetTabItems.reduce<Record<string, number>>((acc, item) => {
    acc['All'] = (acc['All'] || 0) + 1;
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const getEmptyMessage = () => {
    if (searchQuery) return `No items matching "${searchQuery}"`;
    if (selectedTab === 'expired') return 'No expired items! Great job keeping food fresh 🎉';
    if (selectedTab === 'consumed') return 'No consumed items yet.';
    return undefined;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Food Items</Text>
      </View>

      {/* Segmented Tab Bar: Active | Expired | Consumed */}
      <View style={styles.tabSwitcherContainer}>
        <View style={styles.tabSwitcherRow}>
          <TouchableOpacity
            onPress={() => setSelectedTab('active')}
            style={[styles.tabSegment, selectedTab === 'active' && styles.tabSegmentActive]}>
            <Text style={[styles.tabSegmentText, selectedTab === 'active' && styles.tabSegmentTextActive]}>
              Active ({activeItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('expired')}
            style={[styles.tabSegment, selectedTab === 'expired' && styles.tabSegmentActiveExpired]}>
            <Text style={[styles.tabSegmentText, selectedTab === 'expired' && styles.tabSegmentTextExpired]}>
              Expired ({expiredItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('consumed')}
            style={[styles.tabSegment, selectedTab === 'consumed' && styles.tabSegmentActiveConsumed]}>
            <Text style={[styles.tabSegmentText, selectedTab === 'consumed' && styles.tabSegmentTextConsumed]}>
              Consumed ({consumedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Search Input Bar with Filter Icon */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search items..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips */}
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
            message={getEmptyMessage()}
          />
        }
      />
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
  tabSwitcherContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  tabSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabSegmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabSegmentActiveExpired: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  tabSegmentActiveConsumed: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  tabSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabSegmentTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  tabSegmentTextExpired: {
    color: '#DC2626',
    fontWeight: '700',
  },
  tabSegmentTextConsumed: {
    color: '#15803D',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    padding: 10,
  },
});
