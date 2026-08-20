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
 * Seeds initial sample data on first launch so user can see visual UI right away
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
      name: 'Fresh Whole Milk',
      category: 'Food',
      quantity: '1 Liter',
      expiryDate: getDateOffset(0), // Expires Today
      location: 'Fridge Main Shelf',
      notes: 'Opened 2 days ago',
      imageUri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_2',
      name: 'Red Tomatoes',
      category: 'Produce',
      quantity: '500 grams',
      expiryDate: getDateOffset(1), // Expires Tomorrow
      location: 'Vegetable Drawer',
      notes: 'Use for pasta sauce',
      imageUri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_3',
      name: 'Whole Wheat Bread',
      category: 'Food',
      quantity: '1 Pack',
      expiryDate: getDateOffset(2), // Expires in 2 days
      location: 'Kitchen Counter',
      notes: 'Keep dry',
      imageUri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_4',
      name: 'Greek Yogurt',
      category: 'Food',
      quantity: '400g tub',
      expiryDate: getDateOffset(4), // Expires in 4 days
      location: 'Fridge Top Shelf',
      notes: 'Honey vanilla flavor',
      imageUri: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_5',
      name: 'Paracetamol Tablets',
      category: 'Medicine',
      quantity: '1 Strip (10 tabs)',
      expiryDate: getDateOffset(6), // Expires in 6 days
      location: 'Medicine Box',
      notes: 'Pain reliever',
      imageUri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_6',
      name: 'Crisp Gala Apples',
      category: 'Produce',
      quantity: '6 pieces',
      expiryDate: getDateOffset(10), // Fresh (10 days)
      location: 'Fruit Basket',
      notes: 'Organic red apples',
      imageUri: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
  ];

  await saveItems(initialItems);
  return initialItems;
}
