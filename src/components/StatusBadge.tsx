import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getExpiryStatus, getExpiryLabel, getStatusTheme } from '@/utils/dateUtils';
import { ExpiryStatus } from '@/types/item';

interface StatusBadgeProps {
  expiryDate: string;
  size?: 'small' | 'medium' | 'large';
  showLabelOnly?: boolean;
}

export function StatusBadge({ expiryDate, size = 'medium', showLabelOnly = false }: StatusBadgeProps) {
  const status: ExpiryStatus = getExpiryStatus(expiryDate);
  const theme = getStatusTheme(status);
  const relativeLabel = getExpiryLabel(expiryDate);

  if (showLabelOnly) {
    return (
      <View style={[styles.inlineContainer, { backgroundColor: theme.bg }]}>
        <Text style={styles.dot}>{theme.dot}</Text>
        <Text style={[styles.inlineText, { color: theme.text }]}>{relativeLabel}</Text>
      </View>
    );
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: theme.bg, borderColor: theme.border },
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
      ]}>
      <View style={[styles.dotCircle, { backgroundColor: theme.badgeBg }]} />
      <Text
        style={[
          styles.badgeText,
          { color: theme.text },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}>
        {relativeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    gap: 8,
  },
  dotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 11,
  },
  textLarge: {
    fontSize: 14,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  dot: {
    fontSize: 12,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
