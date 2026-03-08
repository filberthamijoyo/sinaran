'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'erp_sinaran_';

/**
 * A hook that persists state to sessionStorage.
 * When the user navigates away and comes back, the state is restored.
 * @param key - Unique storage key (will be prefixed)
 * @param initialValue - Initial value if nothing in storage
 * @param enabled - When false, does not read from or write to storage
 * @returns [value, setValue, clearPersisted, restorePersisted]
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T),
  enabled: boolean = true,
): [T, (value: T | ((prev: T) => T)) => void, () => void, () => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const [value, setValue] = useState<T>(() => {
    if (!enabled) return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    try {
      const item = sessionStorage.getItem(storageKey);
      if (item === null) return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
      return JSON.parse(item);
    } catch {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
  });

  useEffect(() => {
    if (enabled) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
      } catch (e) {
        console.warn('Failed to persist state:', e);
      }
    }
  }, [storageKey, value, enabled]);

  const clearPersisted = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
      setValue(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (e) {
      console.warn('Failed to clear persisted state:', e);
    }
  }, [storageKey, initialValue]);

  const restorePersisted = useCallback(() => {
    try {
      const item = sessionStorage.getItem(storageKey);
      if (item !== null) {
        setValue(JSON.parse(item));
      } else {
        setValue(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
      }
    } catch (e) {
      console.warn('Failed to restore persisted state:', e);
    }
  }, [storageKey, initialValue]);

  return [value, setValue, clearPersisted, restorePersisted];
}

export default usePersistedState;
