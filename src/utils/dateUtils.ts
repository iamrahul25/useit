import { ExpiryStatus } from '@/types/item';

/**
 * Calculates full calendar days between target date string and today.
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
 * Returns exact badge label like "5 days left", "2 days left", "26 days left", "Expires today"
 */
export function getDaysLeftLabel(expiryDateStr: string): string {
  const days = getDaysUntilExpiry(expiryDateStr);

  if (days < 0) {
    const absDays = Math.abs(days);
    return absDays === 1 ? '1 day past' : `${absDays} days past`;
  }
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/**
 * Returns color tokens for badge rendering matching the design system:
 * Green (#16A34A), Orange (#F59E0B), Red (#EF4444)
 */
export function getStatusTheme(status: ExpiryStatus) {
  switch (status) {
    case 'expired':
    case 'urgent':
      return {
        bg: '#FEE2E2',
        text: '#DC2626',
        badgeBg: '#EF4444',
        border: '#FCA5A5',
        dot: '🔴',
      };
    case 'soon':
      return {
        bg: '#FEF3C7',
        text: '#D97706',
        badgeBg: '#F59E0B',
        border: '#FDE68A',
        dot: '🟠',
      };
    case 'fresh':
    default:
      return {
        bg: '#E8F5E9',
        text: '#16A34A',
        badgeBg: '#16A34A',
        border: '#BBF7D0',
        dot: '🟢',
      };
  }
}

/**
 * Format date string YYYY-MM-DD to "25 Aug 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
