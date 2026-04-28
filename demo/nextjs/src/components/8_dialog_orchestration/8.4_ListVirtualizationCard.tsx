"use client";

import { Alert, Button, Divider, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDialog } from "dialogist";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { LuListStart } from "react-icons/lu";
import { List, type RowComponentProps } from "react-window";

import { useDemoState } from "@/contexts/DemoStateContext";

import { BaseDemoCard, DemoCardPaper } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import type { DemoSubHeading } from "../common/demoNavData";
import { Code, DemoParagraph, DemoSectionHeading, TextWithCode } from "../common/typography";

const DIALOG_KEY_SAME_KEY = "list-same-key" as const;
const DIALOG_ROOT_SAME_ROOT = "list-same-root" as const;
const CARD_TITLE = "List virtualization";
const CARD_SUB_HEADINGS: DemoSubHeading[] = [{ name: 'Using "replaceSameKey"' }, { name: 'Using "replaceSameRoot"' }];

const ROW_COUNT = 500;
const ROW_HEIGHT = 72;
const MAX_VISIBLE_ROWS = 6;
const LIST_MAX_WIDTH = 200;

const WINDOWED_HINT = "Try opening a dialog for a different row while this one is open.";
const FULLSCREEN_HINT = "Switch to windowed mode in the sandbox to try this demo.";

const REPLACE_SAME_KEY_SNIPPET = `
interface RowData { id: number; name: string }

interface VirtualizedRowProps {
  rows: RowData[];
  onOpen: (row: RowData) => void;
}

const VirtualizedRow = ({ rows, index, onOpen }: VirtualizedRowComponentProps) => {
  const row = rows[index];
  return (
    <div>
      <button onClick={() => onOpen(row)}>Open row {row.id}</button>
    </div>
  );
};

// one dialog instance shared across all rows
const VirtualListController = () => {
  const rows = useFetchedRows(); // example data fetching hook
  const dialog = useDialog("item-dialog");

  const handleOpen = (row: RowData) => {
    dialog.open({
      type: "alert",
      title: \`Row \${row.id}\`,
      message: <RowDetail row={row} />,
      onConflict: "replaceSameKey",
    });
  };

  return (
    <VirtualList
      rowComponent={VirtualizedRow}
      rowProps={{ rows, onOpen: handleOpen }}
    />
  );
};`;

const REPLACE_SAME_ROOT_SNIPPET = `
// each row owns its own keyed dialog instance
const VirtualizedRow = ({ rows, index }: VirtualizedRowComponentProps) => {
  const row = rows[index];
  const dialog = useDialog(["item-dialog", row.id]);

  return (
    <div>
      <button
        onClick={() => dialog.open({
          type: "alert",
          title: \`Row \${row.id}\`,
          message: <RowDetail row={row} />,
          onConflict: "replaceSameRoot",
        })}
      >
        Open row {row.id}
      </button>
    </div>
  );
};

const VirtualListController = () => {
  const rows = useFetchedRows();

  return (
    <VirtualList
      rowComponent={VirtualizedRow}
      rowProps={{ rows }}
    />
  );
};`;

interface RowData {
  id: number;
  food: string;
}

const createRows = (): RowData[] => {
  return Array.from({ length: ROW_COUNT }, (_, index) => ({
    id: index + 1,
    food: getRandomFood(),
  }));
}

type VirtualizedRowProps = {
  rows: RowData[];
  lastRowId: number | null;
  onOpen: (row: RowData) => void;
};

type VirtualizedRowComponentProps = RowComponentProps<VirtualizedRowProps>;

type VirtualizedRowSameRootProps = {
  rows: RowData[];
  isFullscreen: boolean;
};

type VirtualizedRowSameRootComponentProps = RowComponentProps<VirtualizedRowSameRootProps>;

const getRandomFood = () => {
  // prettier-ignore
  const foods = [
    "🍇", "🍈", "🍉", "🍊", "🍋", "🍋‍🟩", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅",
    "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🥜", "🫘", "🌰", "🫚",
    "🫛", "🫜", "🍄‍🟫", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟",
    "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗", "🍿", "🧈", "🧂",
    "🥫", "🍝", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡",
    "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "☕", "🍵", "🍶", "🍾",
    "🍷", "🍸", "🍹", "🍺", "🥃", "🥤", "🧋", "🧃" ];
  return foods[Math.floor(Math.random() * foods.length)];
};

type RowDialogMessageProps = {
  food: string;
  description: React.ReactNode;
  isFullscreen: boolean;
};

const RowDialogMessage = ({ food, description, isFullscreen }: RowDialogMessageProps) => (
  <FlexBox column gap={1} maxWidth={360}>
    <DemoParagraph>
      <Typography component="span" variant="subtitle1" fontWeight={600}>
        {food}
      </Typography>{" "}
      {description}
    </DemoParagraph>
    <Divider />
    <Typography variant="caption" color="text.secondary">
      {isFullscreen ? FULLSCREEN_HINT : WINDOWED_HINT}
    </Typography>
  </FlexBox>
);

type VirtualizedRowBaseProps = {
  row: RowData;
  isActive?: boolean;
  style?: React.CSSProperties;
  ariaAttributes?: Record<string, string | number>;
  children: React.ReactNode;
};

const VirtualizedRowBase = ({ row, isActive, style, ariaAttributes, children }: VirtualizedRowBaseProps) => (
  <FlexBox
    component="div"
    column
    gap={0.5}
    p={1.5}
    {...ariaAttributes}
    style={{
      ...style,
      borderBottom: "1px solid var(--mui-palette-divider)",
      backgroundColor: isActive ? "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)" : undefined,
    }}
  >
    <Typography variant="body2" fontWeight={600} color={isActive ? "primary.main" : "text.primary"}>
      {row.food}{" "}
      <Typography component="span" variant="caption" color="text.secondary">
        Row key <Code>{row.id}</Code>
      </Typography>
    </Typography>
    <FlexBox gap={1}>{children}</FlexBox>
  </FlexBox>
);

type VirtualListSectionProps = {
  heading: React.ReactNode;
  rowCount: number;
  children: React.ReactNode;
};

const VirtualListSection = ({ heading, rowCount, children }: VirtualListSectionProps) => (
  <DemoCardPaper title="Try it out" maxWidth={LIST_MAX_WIDTH} mt={0} innerMargin={{ top: 1.5 }}>
    <DemoSectionHeading>{heading}</DemoSectionHeading>
    {children}
    <Typography variant="caption" color="text.secondary">
      Data set size: {rowCount.toLocaleString()} rows
    </Typography>
  </DemoCardPaper>
);

const VirtualizedRow = memo(function VirtualizedRow({
  ariaAttributes,
  index,
  style,
  rows,
  lastRowId,
  onOpen,
}: VirtualizedRowComponentProps) {
  const row = rows[index];

  if (!row) return null;

  return (
    <VirtualizedRowBase row={row} isActive={lastRowId === row.id} style={style} ariaAttributes={ariaAttributes}>
      <Button size="small" variant="contained" onClick={() => onOpen(row)}>
        Open dialog
      </Button>
    </VirtualizedRowBase>
  );
});

const VirtualizedRowSameRoot = memo(function VirtualizedRowSameRoot({
  ariaAttributes,
  index,
  style,
  rows,
  isFullscreen,
}: VirtualizedRowSameRootComponentProps) {
  const row = rows[index];
  const dialog = useDialog([DIALOG_ROOT_SAME_ROOT, row?.id ?? 0]);

  if (!row) return null;

  return (
    <VirtualizedRowBase row={row} style={style} ariaAttributes={ariaAttributes}>
      <Button
        size="small"
        variant="contained"
        onClick={() =>
          dialog.open({
            type: "alert",
            title: `Row ${row.id}`,
            message: (
              <RowDialogMessage
                food={row.food}
                isFullscreen={isFullscreen}
                description={
                  <>
                    Each row owns its own dialog key. <Code>onConflict: &quot;replaceSameRoot&quot;</Code> ensures only
                    one dialog is shown at a time across all rows.
                  </>
                }
              />
            ),
            okLabel: "Close",
            onConflict: "replaceSameRoot",
          })
        }
      >
        Open dialog
      </Button>
    </VirtualizedRowBase>
  );
});

export const ListVirtualizationCard = Object.assign(
  memo(function VirtualizedDialogRowsDemoCard() {
    const rowsRef = useRef<RowData[]>(createRows());
    const dialog = useDialog(DIALOG_KEY_SAME_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);
    const [lastRowId, setLastRowId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const rows = rowsRef.current;
    const listHeight = Math.min(rows.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT;
    const { isFullscreen } = useDemoState();

    const handleOpen = useCallback(
      (row: RowData) => {
        setError(null);
        setLastRowId(row.id);
        dialog
          .open({
            type: "alert",
            title: `Row ${row.id}`,
            message: (
              <RowDialogMessage
                food={row.food}
                isFullscreen={isFullscreen}
                description={
                  <>
                    The controller manages a single shared dialog key.{" "}
                    <Code>onConflict: &quot;replaceSameKey&quot;</Code> updates the dialog content in place.
                  </>
                }
              />
            ),
            okLabel: "Close",
            onConflict: "replaceSameKey",
            onOkClick: () => {
              setResult({ text: `Closed row ${row.id}`, color: "info.main" });
            },
          })
          .catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
          });
      },
      [dialog, isFullscreen],
    );

    const rowPropsSameKey = useMemo<VirtualizedRowProps>(
      () => ({ rows, lastRowId, onOpen: handleOpen }),
      [rows, lastRowId, handleOpen],
    );

    const rowPropsSameRoot = useMemo<VirtualizedRowSameRootProps>(() => ({ rows, isFullscreen }), [rows, isFullscreen]);

    return (
      <BaseDemoCard
        icon={withGenericOutlineIcon(LuListStart)}
        iconSize={22}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY_SAME_KEY}
        description={
          <>
            In virtualized or high-frequency lists, creating a dialog per row can be inefficient. Instead, share a
            single dialog instance and update its content in place.
          </>
        }
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            When working with high-frequency lists, use a shared dialog key or common root key to ensure a single dialog
            instance is used for all rows. This way, instead of each row creating its own dialog, the same instance is
            reused and its content updates in place.
          </DemoParagraph>
          <DemoParagraph>
            To enable this behavior, choose a conflict policy that allows the dialog to update in place when a new row
            is opened.
          </DemoParagraph>
          <DemoSectionHeading subtitle="Using replaceSameKey">
            <TextWithCode text={CARD_SUB_HEADINGS[0].name} code='"replaceSameKey"' />
          </DemoSectionHeading>
          <DemoParagraph component="div">
            This policy allows dialog replacement only when the <Code>dialogKey</Code> is exactly the same. This is
            ideal when your list controller manages the dialog's state:
          </DemoParagraph>
          <CodeBlock>{REPLACE_SAME_KEY_SNIPPET}</CodeBlock>
          <VirtualListSection
            heading={<TextWithCode text='"replaceSameKey" virtual list' code='"replaceSameKey"' />}
            rowCount={rows.length}
          >
            <List<VirtualizedRowProps>
              defaultHeight={listHeight}
              rowCount={rows.length}
              rowHeight={ROW_HEIGHT}
              overscanCount={4}
              rowComponent={VirtualizedRow}
              rowProps={rowPropsSameKey}
              style={{ borderRadius: 8, overflow: "auto", height: listHeight }}
            />
          </VirtualListSection>

          {error && (
            <Alert severity="warning" variant="outlined">
              {error}
            </Alert>
          )}

          <DemoSectionHeading subtitle="Using replaceSameRoot">
            <TextWithCode text={CARD_SUB_HEADINGS[1].name} code='"replaceSameRoot"' />
          </DemoSectionHeading>
          <DemoParagraph>
            This policy allows dialog replacement as long as keys share the same root. This can be useful when each row
            manages the dialog's state.
          </DemoParagraph>
          <CodeBlock>{REPLACE_SAME_ROOT_SNIPPET}</CodeBlock>
          <VirtualListSection
            heading={<TextWithCode text="replaceSameRoot virtual list" code='"replaceSameRoot"' />}
            rowCount={rows.length}
          >
            <List<VirtualizedRowSameRootProps>
              defaultHeight={listHeight}
              rowCount={rows.length}
              rowHeight={ROW_HEIGHT}
              overscanCount={4}
              rowComponent={VirtualizedRowSameRoot}
              rowProps={rowPropsSameRoot}
              style={{ borderRadius: 8, overflow: "auto", height: listHeight }}
            />
          </VirtualListSection>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUB_HEADINGS,
  },
);
