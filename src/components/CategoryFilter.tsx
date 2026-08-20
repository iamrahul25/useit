import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { CategoryFilterType } from '@/types/item';

interface CategoryFilterProps {
  selectedCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES: { label: string; value: CategoryFilterType }[] = [
  { label: 'All', value: 'All' },
  { label: 'Dairy', value: 'Dairy' },
  { label: 'Vegetables', value: 'Vegetables' },
  { label: 'Fruits', value: 'Fruits' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Bakery', value: 'Bakery' },
  { label: 'Beverages', value: 'Beverages' },
  { label: 'Medicine', value: 'Medicine' },
  { label: 'Other', value: 'Other' },
];

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          const count = categoryCounts[cat.value];
          const displayLabel = typeof count === 'number' && count > 0 ? `${cat.label} (${count})` : cat.label;

          return (
            <TouchableOpacity
              key={cat.value}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.value)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}>
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}>
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#16A34A',
  },
  chipUnselected: {
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#374151',
  },
});
