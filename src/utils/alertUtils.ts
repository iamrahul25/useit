import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog that works on Mobile (iOS / Android) and Web.
 */
export function confirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmButtonText: string = 'Delete',
  isDestructive: boolean = true
): void {
  if (Platform.OS === 'web') {
    const accepted = window.confirm(`${title}\n\n${message}`);
    if (accepted) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmButtonText,
        style: isDestructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
}

/**
 * Cross-platform simple alert dialog (e.g. error or info)
 */
export function alertDialog(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
