"use client";

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface DemoSectionProps {
  title: string;
  children: ReactNode;
  layout?: "auto" | "twoColumnManual";
}

export const DemoSection = ({ title, children, layout = "auto" }: DemoSectionProps) => {
  return (
    <Box>
      <Box mt={4} mb={1}>
        <Typography variant="h2" component="h2">
          {title}
        </Typography>
      </Box>
      <Box
        display="grid"
        gap={{ xs: 2, md: 3 }}
        sx={
          layout === "twoColumnManual"
            ? {
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }
            : {
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
              }
        }
      >
        {children}
      </Box>
    </Box>
  );
};
