"use client";
import { slicedToArray as _slicedToArray } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useState, useEffect } from 'react';

/**
 * Hook to detect if a specific key is currently pressed.
 * @param key - The key to detect (e.g., "Shift", "Control", "Alt", "Meta", or a specific key code)
 * @returns boolean indicating if the key is currently pressed
 */
var useKeyPress = function useKeyPress(key) {
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isPressed = _useState2[0],
    setIsPressed = _useState2[1];
  var rKey = key.toLowerCase();
  useEffect(function () {
    var handleKeyDown = function handleKeyDown(event) {
      if (event.key.toLowerCase() === rKey || event.code.toLowerCase() === rKey) {
        setIsPressed(true);
      }
    };
    var handleKeyUp = function handleKeyUp(event) {
      if (event.key.toLowerCase() === rKey || event.code.toLowerCase() === rKey) {
        setIsPressed(false);
      }
    };
    var handleBlur = function handleBlur() {
      // Reset key state when window loses focus to handle cases where
      // key is released outside the browser window
      setIsPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return function () {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [rKey]);
  return isPressed;
};

export { useKeyPress };
//# sourceMappingURL=useKeyPress.js.map
