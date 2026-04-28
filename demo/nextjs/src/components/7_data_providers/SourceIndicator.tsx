"use client";

import { Chip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

// Shared source indicator component for external state demos
export const SourceIndicator = ({ source, label }: { source: "dialog" | "external"; label: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const prevSourceRef = useRef<"dialog" | "external" | null>(null);

  useEffect(() => {
    if (prevSourceRef.current !== null && prevSourceRef.current !== source) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
    prevSourceRef.current = source;
  }, [source]);

  if (!isVisible) return null;

  return (
    <Chip
      label={label}
      size="small"
      color={source === "dialog" ? "primary" : "success"}
      sx={{
        animation: "fadeInOut 2s ease-in-out",
        "@keyframes fadeInOut": {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "10%": { opacity: 1, transform: "scale(1)" },
          "90%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 0, transform: "scale(0.8)" },
        },
      }}
    />
  );
};
