import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Item, ItemCategory } from '@/types/item';
import { StatusBadge } from './StatusBadge';
import { formatDisplayDate, getExpiryStatus, getStatusTheme } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  Dairy: '🥛',
  Vegetables: '🥦',
  Fruits: '🍎',
  Snacks: '🥜',
  'Meat & Seafood': '🥩',
  Bakery: '🍞',
  Beverages: '🧃',
  Medicine: '💊',
  Other: '📦',
};

function getRecurringBadgeText(item: Item): string {
  if (item.recurringFrequency === 'every_2_days') return 'Every 2 days';
  if (item.recurringFrequency === 'every_x_days') return `Every ${item.recurringCustomDays || 1} days`;
  if (item.recurringFrequency === 'every_week') return 'Every week';
  if (item.recurringFrequency === 'every_month') return 'Every month';
  return 'Every day';
}

export function ItemCard({ item, onPress, compact = false }: ItemCardProps) {
  const router = useRouter();
  const status = getExpiryStatus(item.expiryDate);
  const theme = getStatusTheme(status);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: '/item/[id]', params: { id: item.id } });
    }
  };

  const categoryEmoji = CATEGORY_ICONS[item.category] || '📦';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.card}>
      {/* Food Thumbnail */}
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.bg }]}>
            <Text style={styles.placeholderEmoji}>{categoryEmoji}</Text>
          </View>
        )}
      </View>

      {/* Item Information */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        {/* Category & Recurring Badge */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>

          {item.isRecurringNotificationEnabled && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat-outline" size={12} color="#15803D" />
              <Text style={styles.recurringBadgeText}>{getRecurringBadgeText(item)}</Text>
            </View>
          )}
        </View>

        {/* Expiry Date & Remaining Days Pill */}
        <View style={styles.expiryRow}>
          <Text style={styles.expiryLabel}>
            {item.isConsumed ? 'Consumed' : 'Expires on'}{' '}
            <Text style={[styles.expiryDateValue, { color: item.isConsumed ? '#15803D' : theme.text }]}>
              {formatDisplayDate(item.expiryDate)}
            </Text>
          </Text>

          <StatusBadge expiryDate={item.expiryDate} isConsumed={item.isConsumed} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 6,
  },
  menuIconButton: {
    padding: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 6,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  recurringBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  recurringBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  expiryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  expiryDateValue: {
    fontWeight: '700',
  },
});
