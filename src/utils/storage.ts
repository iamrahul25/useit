import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Item } from '@/types/item';
import { scheduleItemReminders, cancelItemReminders } from './notifications';

const STORAGE_KEY = '@useit_items_catalog_v1';

function getImagesDirectory(): string | null {
  try {
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).Paths?.documentDirectory;
    return docDir ? `${docDir}useit_images/` : null;
  } catch (e) {
    return null;
  }
}

/**
 * Ensures the local images folder exists
 */
async function ensureDirExists(): Promise<string | null> {
  const imagesDir = getImagesDirectory();
  if (!imagesDir) return null;
  try {
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }
    return imagesDir;
  } catch (error) {
    console.warn('Error creating images directory:', error);
    return null;
  }
}

/**
 * Copies a temporary photo URI into persistent local document storage
 */
export async function saveImageLocally(tempUri: string): Promise<string> {
  if (!tempUri) return tempUri;

  // If it's already a web image or remote URL or local storage path, return as is
  if (tempUri.startsWith('http') || tempUri.includes('useit_images')) {
    return tempUri;
  }

  try {
    const imagesDir = await ensureDirExists();
    if (!imagesDir) return tempUri;

    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const destPath = `${imagesDir}${filename}`;
    await FileSystem.copyAsync({
      from: tempUri,
      to: destPath,
    });
    return destPath;
  } catch (error) {
    console.warn('Failed to save image locally, using original temp URI:', error);
    return tempUri;
  }
}

/**
 * Retrieves all catalog items from AsyncStorage
 */
export async function getItems(): Promise<Item[]> {
  try {
    const jsonStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonStr) {
      return await seedInitialDataIfEmpty();
    }
    const parsed = JSON.parse(jsonStr) as Item[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error fetching items from storage:', error);
    return [];
  }
}

/**
 * Saves all items to AsyncStorage
 */
export async function saveItems(items: Item[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving items to storage:', error);
  }
}

/**
 * Adds a new item to storage, saves photo locally, and schedules notification
 */
export async function addItem(itemData: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
  const existing = await getItems();

  let finalImageUri = itemData.imageUri;
  if (itemData.imageUri) {
    finalImageUri = await saveImageLocally(itemData.imageUri);
  }

  const newItem: Item = {
    ...itemData,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    imageUri: finalImageUri,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...existing];
  await saveItems(updated);
  await scheduleItemReminders(newItem);

  return newItem;
}

/**
 * Updates an existing item in storage
 */
export async function updateItem(updatedItem: Item): Promise<void> {
  const existing = await getItems();
  let finalImageUri = updatedItem.imageUri;

  if (updatedItem.imageUri && !updatedItem.imageUri.includes('useit_images')) {
    finalImageUri = await saveImageLocally(updatedItem.imageUri);
  }

  const itemToSave = { ...updatedItem, imageUri: finalImageUri };
  const updated = existing.map((i) => (i.id === itemToSave.id ? itemToSave : i));
  await saveItems(updated);
  await scheduleItemReminders(itemToSave);
}

/**
 * Deletes an item from storage and cancels notifications
 */
export async function deleteItem(id: string): Promise<void> {
  const existing = await getItems();
  const filtered = existing.filter((item) => item.id !== id);
  await saveItems(filtered);
  await cancelItemReminders(id);
}

/**
 * Seeds initial sample data matching the design prototype
 */
export async function seedInitialDataIfEmpty(): Promise<Item[]> {
  const today = new Date();

  const getDateOffset = (daysOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const initialItems: Item[] = [
    {
      id: 'sample_1',
      name: 'Chobani Greek Yogurt Blueberry',
      category: 'Dairy',
      quantity: '200g tub',
      expiryDate: getDateOffset(5), // 5 days left (25 Aug 2026)
      location: 'Fridge Top Shelf',
      notes: 'Keep chilled below 4°C',
      imageUri: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_2',
      name: 'Amul Fresh Milk',
      category: 'Dairy',
      quantity: '1 Liter',
      expiryDate: getDateOffset(8), // 8 days left (28 Aug 2026)
      location: 'Fridge Door',
      notes: 'Pasteurized whole milk',
      imageUri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_3',
      name: 'Fresh Spinach',
      category: 'Vegetables',
      quantity: '250g pack',
      expiryDate: getDateOffset(2), // 2 days left (22 Aug 2026)
      location: 'Crisper Drawer',
      notes: 'Wash before salad preparation',
      imageUri: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_4',
      name: 'Almonds',
      category: 'Snacks',
      quantity: '500g jar',
      expiryDate: getDateOffset(26), // 26 days left (15 Sep 2026)
      location: 'Pantry Shelf',
      notes: 'Raw organic almonds',
      imageUri: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
  ];

  await saveItems(initialItems);
  return initialItems;
}
