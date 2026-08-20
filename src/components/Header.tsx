import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  totalItems: number;
  expiringSoonCount: number;
}

export function Header({ totalItems, expiringSoonCount }: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.titleText}>UseIt Visual Catalog</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        {expiringSoonCount > 0 && (
          <View style={[styles.statBox, styles.urgentBox]}>
            <Text style={[styles.statNumber, styles.urgentText]}>{expiringSoonCount}</Text>
            <Text style={[styles.statLabel, styles.urgentText]}>Expiring Soon</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urgentBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  urgentText: {
    color: '#C2410C',
  },
});
