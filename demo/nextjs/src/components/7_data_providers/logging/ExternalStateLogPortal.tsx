"use client";

import { Box, Fab, IconButton, Paper, Typography } from "@mui/material";
import { useDialogIsOpen } from "dialogist";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

import { clearExternalStateLogs, useExternalStateLogs } from "./logStore";

interface ExternalStateLogPortalProps {
  dialogId: string;
  title: string;
  /** Stacking offset when multiple demo cards each mount a portal (horizontal from the right edge). */
  index?: number;
  /** Shown on the orb: current todo count. When omitted, falls back to the number of log entries. */
  badgeCount?: number;
}

export const ExternalStateLogPortal = ({ dialogId, title, index = 0, badgeCount }: ExternalStateLogPortalProps) => {
  const logs = useExternalStateLogs(dialogId);
  const isDialogOpen = useDialogIsOpen(dialogId);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = document.createElement("div");
    el.dataset.dialogLogPortal = dialogId;
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      document.body.removeChild(el);
    };
  }, [dialogId]);

  useEffect(() => {
    if (logs.length === 0) {
      setExpanded(false);
    }
  }, [logs]);

  useEffect(() => {
    if (!isDialogOpen) {
      setExpanded(false);
      clearExternalStateLogs(dialogId);
    }
  }, [dialogId, isDialogOpen]);

  const offsetRightPx = useMemo(() => 16 + index * 56, [index]);

  const displayCount = badgeCount ?? logs.length;

  if (!container || !isDialogOpen) return null;

  const orb = (
    <Fab
      color="primary"
      size="small"
      onClick={() => setExpanded(true)}
      sx={{ pointerEvents: "auto", boxShadow: 4 }}
      aria-label={`${title} todo count and sync log`}
    >
      {displayCount}
    </Fab>
  );

  const panel = (
    <Paper
      sx={{
        width: 420,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: 240,
        p: 1.5,
        pointerEvents: "auto",
        position: "relative",
        boxShadow: (theme) => theme.shadows[24],
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <IconButton
        size="small"
        onClick={() => setExpanded(false)}
        sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
        aria-label="Collapse log"
      >
        <MdClose size={16} />
      </IconButton>
      <Typography variant="body2" fontWeight={600} pr={3} gutterBottom>
        {title} logs
      </Typography>
      <div
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          minHeight: 0,
        }}
      >
        {logs.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No sync events logged for this session yet.
          </Typography>
        ) : (
          logs
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry) => (
              <Typography
                key={entry.id}
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", fontFamily: "monospace", fontSize: "0.7rem", py: 0.25 }}
              >
                {`[SoR: ${entry.sor}] ${new Date(entry.timestamp).toLocaleTimeString()}${
                  entry.change ? ` - ${entry.change}` : ""
                }`}
              </Typography>
            ))
        )}
      </div>
    </Paper>
  );

  return createPortal(
    <Box
      sx={{
        position: "fixed",
        right: `${offsetRightPx}px`,
        bottom: (theme) => theme.spacing(2),
        zIndex: (theme) => theme.zIndex.snackbar,
        pointerEvents: "none",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {expanded ? panel : orb}
    </Box>,
    container,
  );
}
