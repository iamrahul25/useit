import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getExpiryStatus, getDaysLeftLabel, getStatusTheme } from '@/utils/dateUtils';
import { ExpiryStatus } from '@/types/item';

interface StatusBadgeProps {
  expiryDate: string;
}

export function StatusBadge({ expiryDate }: StatusBadgeProps) {
  const status: ExpiryStatus = getExpiryStatus(expiryDate);
  const theme = getStatusTheme(status);
  const label = getDaysLeftLabel(expiryDate);

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }]}>
      <Text style={[styles.badgeText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
