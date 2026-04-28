"use client";

import { useEffect, useState } from "react";

/**
 * Hook that syncs state with localStorage, similar to useState API
 *
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple [value, setValue] just like useState
 *
 * @example
 * const [isFullscreen, setIsFullscreen] = useLocalStorage('fullscreen', true);
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  // Initialize with default value to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  /** Prevents writing default state over an existing key before we've read localStorage. */
  const [hasReadStorage, setHasReadStorage] = useState(false);

  // Load from localStorage after mount (must complete before we persist — otherwise the
  // sync effect would run first with initialValue and overwrite e.g. false with true).
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      // If parsing fails, use initial value
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setHasReadStorage(true);
    }
  }, [key]);

  // Sync to localStorage only after initial read (avoids clobbering saved preferences)
  useEffect(() => {
    if (!hasReadStorage) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, hasReadStorage]);

  // setValue function that matches useState API (supports both direct value and updater function)
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.warn(`Error updating localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
