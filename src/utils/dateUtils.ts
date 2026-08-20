import { ExpiryStatus } from '@/types/item';

/**
 * Calculates the difference in full calendar days between target date string and today.
 */
export function getDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines ExpiryStatus based on days remaining:
 * - expired: <= 0
 * - urgent: 1..2
 * - soon: 3..7
 * - fresh: > 7
 */
export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  const days = getDaysUntilExpiry(expiryDateStr);
  if (days <= 0) return 'expired';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'soon';
  return 'fresh';
}

/**
 * Returns human-centered string like "Expires today", "Expires tomorrow", "Expires in 3 days", "Expired 2 days ago"
 */
export function getExpiryLabel(expiryDateStr: string): string {
  const days = getDaysUntilExpiry(expiryDateStr);

  if (days < 0) {
    const absDays = Math.abs(days);
    return absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`;
  }
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days === 2) return 'Expires in 2 days';
  return `Expires in ${days} days`;
}

/**
 * Returns color tokens for badge rendering
 */
export function getStatusTheme(status: ExpiryStatus) {
  switch (status) {
    case 'expired':
      return {
        bg: '#FEE2E2',
        text: '#991B1B',
        badgeBg: '#EF4444',
        border: '#FCA5A5',
        dot: '🔴',
        label: 'Expired / Today',
      };
    case 'urgent':
      return {
        bg: '#FFEDD5',
        text: '#9A3412',
        badgeBg: '#F97316',
        border: '#FDBA74',
        dot: '🟠',
        label: 'Urgent (1–2 days)',
      };
    case 'soon':
      return {
        bg: '#FEF9C3',
        text: '#854D0E',
        badgeBg: '#EAB308',
        border: '#FDE047',
        dot: '🟡',
        label: 'Soon (3–7 days)',
      };
    case 'fresh':
    default:
      return {
        bg: '#DCFCE7',
        text: '#166534',
        badgeBg: '#22C55E',
        border: '#86EFAC',
        dot: '🟢',
        label: 'Fresh (> 7 days)',
      };
  }
}

/**
 * Format ISO string YYYY-MM-DD to localized date display format e.g. "Aug 24, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
