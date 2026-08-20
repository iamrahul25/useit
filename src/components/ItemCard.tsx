import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '@/types/item';
import { StatusBadge } from './StatusBadge';
import { getExpiryStatus, getStatusTheme } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  onDelete?: (item: Item) => void;
  compact?: boolean;
}

export function ItemCard({ item, onPress, onDelete, compact = false }: ItemCardProps) {
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

  const handleDeletePress = (e?: any) => {
    // Prevent event bubbling on Web and Mobile
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.card, { borderColor: theme.border }]}>
      {/* Visual Thumbnail */}
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
            <Text style={styles.placeholderEmoji}>
              {item.category === 'Food'
                ? '🥛'
                : item.category === 'Medicine'
                ? '💊'
                : item.category === 'Produce'
                ? '🍎'
                : item.category === 'Cosmetics'
                ? '🧴'
                : item.category === 'Supplements'
                ? '🌿'
                : '📦'}
            </Text>
          </View>
        )}
        <View style={styles.badgeOverlay}>
          <StatusBadge expiryDate={item.expiryDate} size="small" />
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>

          {onDelete && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDeletePress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.deleteIconButton}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          {item.quantity ? (
            <Text style={styles.quantityText} numberOfLines={1}>
              • {item.quantity}
            </Text>
          ) : null}
        </View>

        {item.location ? (
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {item.location}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 96,
    height: 96,
    position: 'relative',
    backgroundColor: '#F8FAFC',
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
    fontSize: 36,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    zIndex: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  quantityText: {
    fontSize: 12,
    color: '#64748B',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
