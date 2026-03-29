import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Spinning module utilities - stub implementations
export const toStr = <T>(v: T): string => String(v ?? '');
export const toYMD = (d: Date | string | null | undefined): string => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().split('T')[0];
};
export const generateLocalId = (prefix: string): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${y}${m}-${seq}`;
};
export const addNumber = (a: number, b: number): number => a + b;
export const addNumberToObj = <T extends Record<string, unknown>>(obj: T, key: string, value: number | undefined): T => ({
  ...obj,
  [key]: ((obj[key] as number) || 0) + (value ?? 0),
});
export const displayValue = <T>(v: T, formatter?: (v: T) => string): string => {
  if (formatter) return formatter(v);
  return v == null ? '-' : String(v);
};
export const formatDate = (d: Date | string | null | undefined): string => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('id-ID');
};
export const getYear = (d: Date | string | null | undefined): number => {
  if (!d) return 0;
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.getFullYear();
};
export const getYearMonth = (d: Date | string | null | undefined): string => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
