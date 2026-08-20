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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ItemCategory } from '@/types/item';
import { addItem } from '@/utils/storage';
import { formatDisplayDate } from '@/utils/dateUtils';

const CATEGORIES: { label: string; value: ItemCategory; emoji: string }[] = [
  { label: 'Dairy', value: 'Dairy', emoji: '🥛' },
  { label: 'Vegetables', value: 'Vegetables', emoji: '🥦' },
  { label: 'Fruits', value: 'Fruits', emoji: '🍎' },
  { label: 'Snacks', value: 'Snacks', emoji: '🥜' },
  { label: 'Meat & Seafood', value: 'Meat & Seafood', emoji: '🥩' },
  { label: 'Bakery', value: 'Bakery', emoji: '🍞' },
  { label: 'Beverages', value: 'Beverages', emoji: '🧃' },
  { label: 'Medicine', value: 'Medicine', emoji: '💊' },
  { label: 'Other', value: 'Other', emoji: '📦' },
];

export default function AddItemScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Default expiry date: 5 days from today
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 5);
  const [expiryDateObj, setExpiryDateObj] = useState<Date>(defaultDate);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const expiryDateStr = expiryDateObj.toISOString().split('T')[0];

  const handleTakeCameraPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Camera permission is required to snap food photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
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
        Alert.alert('Permission Needed', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Gallery Error', 'Could not access photo library.');
    }
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
      Alert.alert('Required Field', 'Please enter an item name.');
      return;
    }

    if (!category) {
      Alert.alert('Required Field', 'Please select a category.');
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

  const selectedCategoryObj = CATEGORIES.find((c) => c.value === category);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Large Camera / Photo Capture Area */}
        <View style={styles.cameraFrame}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cameraImage} contentFit="cover" />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
              <Text style={styles.placeholderTitle}>Take a photo of your item</Text>
              <Text style={styles.placeholderSub}>Tap the capture button or choose from gallery</Text>
            </View>
          )}

          <View style={styles.cameraOverlayBottom}>
            {imageUri ? (
              <TouchableOpacity onPress={() => setImageUri(null)} style={styles.retakeButton}>
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}

            {/* Large Circular Capture Button */}
            <TouchableOpacity onPress={handleTakeCameraPhoto} activeOpacity={0.8} style={styles.shutterOuter}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChooseGalleryPhoto} style={styles.galleryIconButton}>
              <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {/* Item Name */}
          <Text style={styles.inputLabel}>
            Item Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Milk packet, Fresh Spinach, Bread"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          {/* Category Dropdown */}
          <Text style={styles.inputLabel}>
            Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCategoryPicker(true)}
            style={styles.dropdownButton}>
            {selectedCategoryObj ? (
              <>
                <Text style={styles.dropdownEmoji}>{selectedCategoryObj.emoji}</Text>
                <Text style={styles.dropdownText}>{selectedCategoryObj.label}</Text>
              </>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Select Category...</Text>
            )}
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>

          {/* Expiry Date */}
          <Text style={styles.inputLabel}>
            Expiry Date <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.datePickerText}>{formatDisplayDate(expiryDateStr)}</Text>
          </TouchableOpacity>

          {(showDatePicker || Platform.OS === 'ios') && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={expiryDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.iosDoneButton}>
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Notes (Optional) */}
          <Text style={styles.inputLabel}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            placeholder="Add any notes..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {/* Large Green Save Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Item</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => {
                  setCategory(cat.value);
                  setShowCategoryPicker(false);
                }}
                style={styles.modalCategoryRow}>
                <Text style={styles.modalEmoji}>{cat.emoji}</Text>
                <Text style={styles.modalCategoryLabel}>{cat.label}</Text>
                {category === cat.value && <Ionicons name="checkmark" size={20} color="#16A34A" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  cameraFrame: {
    height: 300,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1F2937',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  placeholderTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  placeholderSub: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
  cameraOverlayBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retakeButton: {
    padding: 8,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shutterOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  galleryIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  dropdownEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  datePickerText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  datePickerWrapper: {
    marginVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
  },
  iosDoneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#16A34A',
    borderRadius: 8,
    marginTop: 6,
  },
  iosDoneText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  modalCategoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
});
