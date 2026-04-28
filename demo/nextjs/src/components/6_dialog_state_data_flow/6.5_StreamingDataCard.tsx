"use client";

import { Button, Card, CardContent, Chip, FormControlLabel, LinearProgress, Switch, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDeepEffect, useDeepMemo, useDialog } from "dialogist";
import { memo, useEffect, useRef, useState } from "react";
import { PiWifiMediumDuotone } from "react-icons/pi";

import { Admonition } from "../common/admonition";
import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "live-streaming-demo";
const CARD_TITLE = "Streaming data in dialogs";

const LIVE_DATA_STREAM_SNIPPET = `// Dialogist injects onClose for message/content components.
const PollingContent = ({ onClose, seedData = [] }) => {
  const [data, setData] = useState(seedData);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return; // prevents polling when the dialog is closed
    const interval = setInterval(async () => {
      setData((prev) => [await fetchLatestData(), ...prev.slice(0, 9)]);
    }, 2000);
    return () => clearInterval(interval); // clean up when the dialog closes
  }, [isPolling]);

  return (
    <>
      {/* render rows, polling toggle... */}
      <Button onClick={() => onClose?.()}>Close</Button>
    </>
  );
};

const WebSocketStreamContent = ({ onClose }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (messages.length > 0) return;
    // the component owns the WebSocket connection lifecycle
    const ws = new WebSocket("ws://localhost:8080");
      ws.onmessage = (e) => setMessages((prev) => [...prev, e.data]);
      return () => ws.close(); // clean up when the dialog closes
    }, [messages.length]);

  return (
    <>
      {/* render messages... */}
      <Button onClick={() => onClose?.()}>Close</Button>
    </>
  );
};

const pollEvent = await dialog.open({
  type: "custom",
  title: "Polling example",
  actions: [], // empty — component renders its own close controls
  message: PollingContent,
  // remember: onClose is injected by dialogist automatically, 
  // so no need to pass it via props
  props: { seedData: currentData },
});

console.log(pollEvent.reason, pollEvent.ok, pollEvent.buttonText);

const wsEvent = await dialog.open({
  type: "custom",
  title: "WebSocket example",
  actions: [],
  // remember: 'content' and 'message' are interchangeable;
  // 'content' takes precedence if both are set
  content: WebSocketStreamContent,
  props: { seedData: currentData },
});

console.log(wsEvent.reason, wsEvent.ok, wsEvent.buttonText);
`;

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

type PollingController = {
  get: () => boolean;
  set: (next: boolean) => void;
  subscribe: (listener: (next: boolean) => void) => () => void;
};

interface MockData {
  id: number;
  status: "success" | "error" | "pending";
  message: string;
  timestamp: string;
  value: number;
}

interface DataStats {
  total: number;
  successful: number;
  errors: number;
  pending: number;
  avgValue: number;
}

const mockStatuses = ["success", "error", "pending"] as const;
const mockMessages = [
  "Data sync completed",
  "Processing user request",
  "Network connection stable",
  "Cache refresh in progress",
  "Database query executed",
  "API response received",
  "Validation passed",
  "Connection timeout",
  "Server overloaded",
  "Retry attempt #3",
];

const generateMockData = (): MockData => ({
  // Use a larger space to reduce collisions since we later "resolve" pending items by id.
  id: Date.now() + Math.floor(Math.random() * 1000),
  status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
  message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
  timestamp: new Date().toLocaleTimeString(),
  value: Math.floor(Math.random() * 100),
});

const STATUS_CSS_VAR: Record<MockData["status"], string> = {
  success: "var(--mui-palette-success-main)",
  error: "var(--mui-palette-error-main)",
  pending: "var(--mui-palette-warning-main)",
};

const STATUS_TERMINAL_LEVEL: Record<MockData["status"], string> = {
  success: "OK",
  error: "ERR",
  pending: "...",
};

const schedulePendingResolution = (
  item: MockData,
  setData: React.Dispatch<React.SetStateAction<MockData[]>>,
  timeoutsRef: React.MutableRefObject<number[]>,
) => {
  if (item.status !== "pending") return;
  const delayMs = 700 + Math.floor(Math.random() * 800);
  const timeoutId = window.setTimeout(() => {
    setData((prev) =>
      prev.map((d) =>
        d.id === item.id ? { ...d, status: "success", message: d.message.replace(/in progress$/i, "completed") } : d,
      ),
    );
  }, delayMs);
  timeoutsRef.current.push(timeoutId);
};

const useDataPoller = (active: boolean, seedData: MockData[] = [], seedPollCount = 0) => {
  const [data, setData] = useState<MockData[]>(seedData);
  const [pollCount, setPollCount] = useState(seedPollCount);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => {
        clearTimeout(t);
      });
      timeoutsRef.current = [];
    };
  }, []);

  useDeepEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const newData = generateMockData();
      setData((prev) => [newData, ...prev.slice(0, 4)]);
      schedulePendingResolution(newData, setData, timeoutsRef);
      setPollCount((c) => c + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [active]);

  return { data, pollCount };
};

const usePollingController = (isPolling: boolean, setIsPolling: (next: boolean) => void): PollingController => {
  const valueRef = useRef(isPolling);
  const listenersRef = useRef(new Set<(next: boolean) => void>());

  useEffect(() => {
    valueRef.current = isPolling;
    listenersRef.current.forEach((l) => {
      l(isPolling);
    });
  }, [isPolling]);

  return useRef<PollingController>({
    get: () => valueRef.current,
    set: setIsPolling,
    subscribe: (listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
  }).current;
};

const PollingStatusBar = ({ isPolling }: { isPolling: boolean }) => (
  <FlexBox column sx={{ minWidth: 0 }}>
    <LinearProgress
      variant={isPolling ? "indeterminate" : "determinate"}
      value={isPolling ? undefined : 100}
      sx={{ height: 6, borderRadius: 3 }}
    />
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
      Polling every 2000ms • {isPolling ? "Active" : "Stopped"}
    </Typography>
  </FlexBox>
);

const StatsCard = ({ stats }: { stats: DataStats }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Typography variant="subtitle2" gutterBottom>
        Statistics
      </Typography>
      <FlexBox gap={2} flexWrap="wrap">
        <Chip size="small" label={`Total: ${stats.total}`} />
        <Chip size="small" label={`Success: ${stats.successful}`} color="success" />
        <Chip size="small" label={`Errors: ${stats.errors}`} color="error" />
        <Chip size="small" label={`Pending: ${stats.pending}`} color="warning" />
        <Chip size="small" label={`Avg value: ${stats.avgValue}`} variant="outlined" />
      </FlexBox>
    </CardContent>
  </Card>
);

const TerminalLogRow = ({ item, index }: { item: MockData; index: number }) => (
  <FlexBox sx={{ minWidth: 0, py: 0.25, opacity: index === 0 ? 1 : Math.max(0.55, 0.85 - index * 0.12) }}>
    <Typography
      component="div"
      sx={{
        fontFamily: "inherit",
        fontSize: 12,
        lineHeight: 1.55,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <span style={{ opacity: 0.75 }}>{item.timestamp}</span>
      <span style={{ margin: "0 8px", opacity: 0.35 }}>|</span>
      <span style={{ color: STATUS_CSS_VAR[item.status], fontWeight: 700 }}>
        [{STATUS_TERMINAL_LEVEL[item.status]}]
      </span>
      <span style={{ margin: "0 8px", opacity: 0.35 }}>|</span>
      <span style={{ opacity: 0.95 }}>{item.message}</span>
      <span style={{ margin: "0 8px", opacity: 0.35 }}>|</span>
      <span style={{ opacity: 0.85 }}>value={item.value}</span>
    </Typography>
  </FlexBox>
);

const TerminalLogPanel = ({ data, pollCount }: { data: MockData[]; pollCount: number }) => (
  <FlexBox
    column
    sx={(theme) => ({
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50],
      color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
      minWidth: 0,
      overflow: "hidden",
    })}
  >
    <FlexBox
      y="center"
      sx={(theme) => ({
        px: 1.25,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : theme.palette.grey[100],
        minWidth: 0,
      })}
    >
      <Typography variant="caption" sx={{ fontFamily: MONO_FONT, opacity: 0.9 }}>
        {data.length === 0 ? "Waiting for data…" : `Showing latest ${data.length} events`}
      </Typography>
      <FlexBox flex={1} />
      <Typography variant="caption" sx={{ fontFamily: MONO_FONT, opacity: 0.75 }}>
        {`polls=${pollCount}`}
      </Typography>
    </FlexBox>

    <FlexBox column maxHeight={220} sx={{ overflow: "auto", minWidth: 0, px: 1.25, py: 1, fontFamily: MONO_FONT }}>
      {data.length === 0 ? (
        <Typography variant="caption" sx={{ opacity: 0.7, fontFamily: "inherit", whiteSpace: "nowrap" }}>
          (no events yet)
        </Typography>
      ) : (
        <FlexBox column>
          {data.map((item, index) => (
            <TerminalLogRow key={item.id} item={item} index={index} />
          ))}
        </FlexBox>
      )}
    </FlexBox>
  </FlexBox>
);

interface DataPollingDialogProps {
  /** Injected by dialogist — optional so it doesn't need to be in props. */
  onClose?: (result?: unknown) => void;
  pollingController: PollingController;
  seedData?: MockData[];
  seedPollCount?: number;
}

const DataPollingDialog = ({ onClose, pollingController, seedData, seedPollCount }: DataPollingDialogProps) => {
  const [isPolling, setIsPolling] = useState(() => pollingController.get());
  const { data, pollCount } = useDataPoller(isPolling, seedData, seedPollCount);

  useEffect(() => pollingController.subscribe(setIsPolling), [pollingController]);

  const stats = useDeepMemo((): DataStats => {
    const total = data.length;
    const successful = data.filter((d) => d.status === "success").length;
    const errors = data.filter((d) => d.status === "error").length;
    const pending = data.filter((d) => d.status === "pending").length;
    const avgValue = total > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / total) : 0;
    return { total, successful, errors, pending, avgValue };
  }, [data]);

  const handleTogglePolling = (_: unknown, checked: boolean) => {
    setIsPolling(checked);
    pollingController.set(checked);
  };

  const handleCloseAndStopPolling = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPolling(false);
    pollingController.set(false);
    onClose?.(e.currentTarget.textContent?.trim());
  };

  return (
    <FlexBox column gap={2} position="relative" sx={{ width: "100%", maxWidth: 560, mx: "auto", minWidth: 0, p: 1 }}>
      <FlexBox column gap={2} position="relative" sx={{ minWidth: 0 }}>
        <PollingStatusBar isPolling={isPolling} />
        <StatsCard stats={stats} />
        <FlexBox column sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent activity
          </Typography>
          <TerminalLogPanel data={data} pollCount={pollCount} />
        </FlexBox>
      </FlexBox>

      <FlexBox y="center" x="right" gap={1}>
        <Typography variant="caption" color="text.secondary">
          {isPolling ? "Stop polling" : "Start polling"}
        </Typography>
        <Switch size="small" checked={isPolling} onChange={handleTogglePolling} />
        <Button variant="outlined" onClick={handleCloseAndStopPolling} color="primary">
          Close & stop polling
        </Button>
        <Button variant="contained" onClick={(e) => onClose?.(e.currentTarget.textContent?.trim())} color="primary">
          Close
        </Button>
      </FlexBox>
    </FlexBox>
  );
};

export const StreamingDataCard = Object.assign(
  memo(function DataPollingDialogCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const pollingController = usePollingController(isPolling, setIsPolling);
    const { data: cardData, pollCount: cardPollCount } = useDataPoller(isPolling && !isDialogOpen);

    const handleOpen = async () => {
      setResult(null);
      setIsDialogOpen(true);
      const event = await dialog.open({
        type: "custom",
        title: "Streaming data example",
        actions: [],
        message: DataPollingDialog,
        props: {
          pollingController,
          seedData: cardData,
          seedPollCount: cardPollCount,
          // onClose is not passed — dialogist always injects it so the component can call it
        },
      });
      setIsDialogOpen(false);
      const buttonText = typeof event.resolveValue === "string" ? event.resolveValue : undefined;
      setResult({ text: `${buttonText ?? event.reason} (${event.reason})`, color: "info.main" });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiWifiMediumDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            When your dialog needs to handle streaming or continuously updating data, you can run that logic directly
            inside a custom dialog component.
          </>
        }
        actions={[
          {
            label: "Show polling data dialog",
            onClick: handleOpen,
            icon: <PiWifiMediumDuotone />,
          },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Some dialogs do more than display forms or static content. When polling APIs, consuming WebSocket streams,
            or handling other asynchronous data flows, you'll want to display data as it changes over time.
          </DemoParagraph>
          <DemoParagraph>
            Keep the data flow and its lifecycle (starting, stopping, connecting, disconnecting) inside the dialog
            component itself whenever possible. Treat the dialog as a self-contained system rather than syncing it
            through external state.
          </DemoParagraph>
          <Admonition variant="caution">
            You could bind the dialog to a parent or polling controller (e.g. with <Code>useDialogExternalSync()</Code>
            ), but for high-frequency or long-lived streams, this can become complex — and coordinating state with
            React's render cycle becomes tedious and error-prone.
          </Admonition>
          <CodeBlock>{LIVE_DATA_STREAM_SNIPPET}</CodeBlock>
        </FlexBox>
        <FlexBox mt={2} y="center" gap={2}>
          <FormControlLabel
            sx={{ m: 0 }}
            control={<Switch size="small" checked={isPolling} onChange={(_, c) => setIsPolling(c)} />}
            label={
              <Typography variant="caption" color="text.secondary">
                {`Polling every 2000ms • ${isPolling ? "Active" : "Stopped"}`}
              </Typography>
            }
            labelPlacement="end"
          />
        </FlexBox>
        <DemoSectionHeading subtitle="Try it out" mt={2} mb={1} />
        <DemoParagraph>
          (There is no WebSocket server running in this demo, so only the polling example is available.)
        </DemoParagraph>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: [],
  },
);
