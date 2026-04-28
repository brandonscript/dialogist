"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if a specific key is currently pressed.
 * @param key - The key to detect (e.g., "Shift", "Control", "Alt", "Meta", or a specific key code)
 * @returns boolean indicating if the key is currently pressed
 */
export const useKeyPress = (key: string): boolean => {
  const [isPressed, setIsPressed] = useState(false);
  const rKey = key.toLowerCase();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === rKey || event.code.toLowerCase() === rKey) {
        setIsPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === rKey || event.code.toLowerCase() === rKey) {
        setIsPressed(false);
      }
    };

    const handleBlur = () => {
      // Reset key state when window loses focus to handle cases where
      // key is released outside the browser window
      setIsPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [rKey]);

  return isPressed;
};
