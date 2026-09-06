export type ItemCategory =
  | 'Dairy'
  | 'Vegetables'
  | 'Fruits'
  | 'Snacks'
  | 'Meat & Seafood'
  | 'Bakery'
  | 'Beverages'
  | 'Medicine'
  | 'Other';

export type CategoryFilterType = 'All' | ItemCategory;

export type ExpiryStatus = 'expired' | 'urgent' | 'soon' | 'fresh';

export type ItemTabStatus = 'active' | 'expired' | 'consumed';

export type RecurringFrequency =
  | 'every_day'
  | 'every_2_days'
  | 'every_x_days'
  | 'every_week'
  | 'every_month';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  quantity?: string;
  expiryDate: string; // ISO format string: YYYY-MM-DD
  purchaseDate?: string;
  location?: string;
  notes?: string;
  imageUri?: string;
  createdAt: string;
  isReminded?: boolean;
  isConsumed?: boolean;
  consumedAt?: string;
  isRecurringNotificationEnabled?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringCustomDays?: number;
  recurringNotificationTime?: string; // "HH:mm" format, e.g. "09:00"
}

export interface ExpiryGroup {
  title: string;
  subtitle: string;
  status: ExpiryStatus;
  items: Item[];
}
