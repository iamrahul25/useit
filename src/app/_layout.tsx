import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-item"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: '📸 Add New Item',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#0F172A',
          }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{
            presentation: 'card',
            headerShown: true,
            title: 'Item Details',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#0F172A',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
