import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface EmptyStateProps {
  message?: string;
  categoryFilter?: string;
}

export function EmptyState({ message, categoryFilter }: EmptyStateProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📦</Text>
      <Text style={styles.title}>No items found</Text>
      <Text style={styles.subtitle}>
        {message ||
          (categoryFilter && categoryFilter !== 'All'
            ? `No ${categoryFilter.toLowerCase()} items saved yet.`
            : 'Your visual expiry catalog is empty. Snap a photo of food, medicines, or produce to track them!')}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/add-item')}
        style={styles.addButton}>
        <Text style={styles.addButtonText}>📸 Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
