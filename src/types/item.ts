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
}

export interface ExpiryGroup {
  title: string;
  subtitle: string;
  status: ExpiryStatus;
  items: Item[];
}
