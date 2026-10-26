// Utility helpers
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    verified: 'badge-verified',
    connected: 'badge-connected',
    healthy: 'badge-verified',
    awaiting: 'badge-pending',
    awaiting_verification: 'badge-pending',
    stale: 'badge-stale',
    rejected: 'badge-rejected',
    failed: 'badge-failed',
    syncing: 'badge-syncing',
    unverified: 'badge-unverified',
    not_linked: 'badge-unverified',
    access_unavailable: 'badge-stale',
    unsupported: 'badge-unverified',
  };
  return map[status] ?? 'badge-unverified';
}
