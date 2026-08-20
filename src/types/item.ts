export type ItemCategory =
  | 'Food'
  | 'Medicine'
  | 'Produce'
  | 'Consumables'
  | 'Cosmetics'
  | 'Supplements'
  | 'Other';

export type CategoryFilterType = 'All' | ItemCategory;

export type ExpiryStatus = 'expired' | 'urgent' | 'soon' | 'fresh';

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
}

export interface ExpiryGroup {
  title: string;
  subtitle: string;
  status: ExpiryStatus;
  items: Item[];
}
