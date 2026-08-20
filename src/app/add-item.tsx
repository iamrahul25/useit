import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ItemCategory } from '@/types/item';
import { addItem } from '@/utils/storage';

const CATEGORIES: { label: string; value: ItemCategory; emoji: string }[] = [
  { label: 'Food', value: 'Food', emoji: '🥛' },
  { label: 'Medicine', value: 'Medicine', emoji: '💊' },
  { label: 'Produce', value: 'Produce', emoji: '🍎' },
  { label: 'Consumables', value: 'Consumables', emoji: '🧃' },
  { label: 'Cosmetics', value: 'Cosmetics', emoji: '🧴' },
  { label: 'Supplements', value: 'Supplements', emoji: '🌿' },
  { label: 'Other', value: 'Other', emoji: '🏷️' },
];

export default function AddItemScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Food');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Default expiry date: 3 days from today
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const [expiryDateObj, setExpiryDateObj] = useState<Date>(defaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Format YYYY-MM-DD
  const expiryDateStr = expiryDateObj.toISOString().split('T')[0];

  const handleTakeCameraPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Camera permission is required to snap item photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handleChooseGalleryPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Gallery permission is required to choose photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Gallery Error', 'Could not access photo gallery.');
    }
  };

  const handleQuickPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDateObj(d);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiryDateObj(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter an item name (e.g., Milk packet, Tomatoes).');
      return;
    }

    setSaving(true);
    try {
      await addItem({
        name: name.trim(),
        category,
        quantity: quantity.trim() || undefined,
        expiryDate: expiryDateStr,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        imageUri: imageUri || undefined,
      });

      setSaving(false);
      router.back();
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Photo Selection Area */}
        <Text style={styles.sectionLabel}>ITEM PHOTO</Text>
        {imageUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.photoPreview} contentFit="cover" />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setImageUri(null)}
              style={styles.removePhotoButton}>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTakeCameraPhoto}
              style={[styles.photoButton, styles.cameraButton]}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.cameraBtnText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleChooseGalleryPhoto}
              style={[styles.photoButton, styles.galleryButton]}>
              <Ionicons name="images-outline" size={24} color="#0F172A" />
              <Text style={styles.galleryBtnText}>Choose Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Item Name */}
        <Text style={styles.inputLabel}>
          ITEM NAME <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Fresh Whole Milk, Paracetamol, Bread"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        {/* Category Picker */}
        <Text style={styles.inputLabel}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.8}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.categoryPill,
                  isSelected ? styles.categoryPillSelected : styles.categoryPillUnselected,
                ]}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected ? styles.categoryPillTextSelected : styles.categoryPillTextUnselected,
                  ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Expiry Date Selection */}
        <Text style={styles.inputLabel}>
          EXPIRY DATE <Text style={styles.requiredStar}>*</Text>
        </Text>
        
        {/* Quick Expiry Date Presets */}
        <View style={styles.presetsRow}>
          <TouchableOpacity onPress={() => handleQuickPresetDays(0)} style={styles.presetChip}>
            <Text style={styles.presetText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickPresetDays(1)} style={styles.presetChip}>
            <Text style={styles.presetText}>+1 Day</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickPresetDays(3)} style={styles.presetChip}>
            <Text style={styles.presetText}>+3 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickPresetDays(7)} style={styles.presetChip}>
            <Text style={styles.presetText}>+1 Week</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickPresetDays(30)} style={styles.presetChip}>
            <Text style={styles.presetText}>+1 Month</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDatePicker(true)}
          style={styles.dateSelectorButton}>
          <Ionicons name="calendar-outline" size={20} color="#2563EB" />
          <Text style={styles.dateSelectorText}>{expiryDateStr}</Text>
          <Text style={styles.changeDateLabel}>Tap to change</Text>
        </TouchableOpacity>

        {(showDatePicker || Platform.OS === 'ios') && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={expiryDateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.iosDateDoneBtn}>
                <Text style={styles.iosDateDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quantity (Optional) */}
        <Text style={styles.inputLabel}>QUANTITY (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 1 Packet, 500g, 2 Bottles"
          placeholderTextColor="#94A3B8"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* Location (Optional) */}
        <Text style={styles.inputLabel}>STORAGE LOCATION (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Fridge, Pantry, Top Drawer"
          placeholderTextColor="#94A3B8"
          value={location}
          onChangeText={setLocation}
        />

        {/* Notes (Optional) */}
        <Text style={styles.inputLabel}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          placeholder="e.g. Opened on Tuesday, consume quickly after opening"
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save to Visual Catalog</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  photoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#2563EB',
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  galleryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  galleryBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  photoPreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    gap: 4,
  },
  categoryPillSelected: {
    backgroundColor: '#0F172A',
  },
  categoryPillUnselected: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
  },
  categoryPillTextUnselected: {
    color: '#475569',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  presetChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  changeDateLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  iosDateDoneBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginTop: 6,
  },
  iosDateDoneText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 28,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
