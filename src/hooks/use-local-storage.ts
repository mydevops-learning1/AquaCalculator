"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs once on mount on the client side
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  useEffect(() => {
    // This effect runs only after initialization and when storedValue changes
    if (isInitialized) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [key, storedValue, isInitialized]);

  // On the server or before initialization, return initialValue and a no-op setter.
  if (!isInitialized) {
      const noOpSetter: Dispatch<SetStateAction<T>> = () => {};
      return [initialValue, noOpSetter];
  }

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
