import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { CategoryFilterType, ItemCategory } from '@/types/item';

interface CategoryFilterProps {
  selectedCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES: { label: string; value: CategoryFilterType; emoji: string }[] = [
  { label: 'All', value: 'All', emoji: '📦' },
  { label: 'Food', value: 'Food', emoji: '🥛' },
  { label: 'Medicine', value: 'Medicine', emoji: '💊' },
  { label: 'Produce', value: 'Produce', emoji: '🍎' },
  { label: 'Consumables', value: 'Consumables', emoji: '🧃' },
  { label: 'Cosmetics', value: 'Cosmetics', emoji: '🧴' },
  { label: 'Supplements', value: 'Supplements', emoji: '🌿' },
  { label: 'Other', value: 'Other', emoji: '🏷️' },
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

          return (
            <TouchableOpacity
              key={cat.value}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.value)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}>
                {cat.label}
              </Text>
              {typeof count === 'number' && count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected,
                  ]}>
                  <Text
                    style={[
                      styles.countText,
                      isSelected ? styles.countTextSelected : styles.countTextUnselected,
                    ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipUnselected: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#475569',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeUnselected: {
    backgroundColor: '#CBD5E1',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
  countTextUnselected: {
    color: '#334155',
  },
});
