// Create me a ResultTypography component that shows text in a slihglyt gray bounding box, similar to code-formatted text but without the monospace font

import {
  Button,
  type ButtonProps,
  List,
  ListItem,
  type ListItemProps,
  type ListProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemProps } from "@mui/system";
import { useContext } from "react";

import { AdmonitionInlineCodeStyleContext } from "../admonition/AdmonitionInlineCodeContext";

const isCancelButton = (buttonText: string) =>
  /\b(cancel|close|exit|back|previous|no|false|nope|stop)\b/i.test(buttonText);

export const ResultButtonValue = ({
  children,
  color: colorProp,
  ...props
}: { children: React.ReactNode } & ButtonProps) => (
  <Button
    size="tiny"
    variant="outlined"
    color={colorProp ?? (isCancelButton(children as string) ? "error" : "success")}
    {...props}
  >
    {children}
  </Button>
);

type MarginSystemProps = Pick<SystemProps, "m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml">;
type PaddingSystemProps = Pick<SystemProps, "p" | "px" | "py" | "pt" | "pr" | "pb" | "pl">;

export type BulletListProps = {
  children: React.ReactNode;
  nested?: boolean;
} & Omit<ListProps, keyof MarginSystemProps | keyof PaddingSystemProps> &
  Partial<MarginSystemProps> &
  Partial<PaddingSystemProps>;

export const BulletList = ({ children, nested, sx, ...props }: BulletListProps) => {
  const { m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl, ...rest } = props;
  return (
    <List
      dense
      {...rest}
      sx={{
        listStyleType: nested ? "circle" : "disc",
        pl: pl !== undefined ? pl : nested ? 2.5 : 3,
        mt: mt !== undefined ? mt : nested ? 0.5 : 0,
        ...(m !== undefined && { m }),
        ...(mx !== undefined && { mx }),
        ...(my !== undefined && { my }),
        ...(mr !== undefined && { mr }),
        ...(mb !== undefined && { mb }),
        ...(ml !== undefined && { ml }),
        ...(p !== undefined && { p }),
        ...(px !== undefined && { px }),
        ...(py !== undefined && { py }),
        ...(pt !== undefined && { pt }),
        ...(pr !== undefined && { pr }),
        ...(pb !== undefined && { pb }),
        ...sx,
      }}
    >
      {children}
    </List>
  );
};

export const BulletListItem = ({ children, ...props }: { children: React.ReactNode } & ListItemProps) => (
  <ListItem {...props} sx={{ display: "list-item", pl: 0.5, py: 0.25, ...props.sx }}>
    {children}
  </ListItem>
);

export const Key = ({ children, ...props }: { children: React.ReactNode } & TypographyProps) => (
  <Typography
    component="span"
    variant="body2"
    {...props}
    sx={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: "0.85em",
      display: "inline-block",
      backgroundColor: (theme) =>
        `color-mix(in srgb, ${theme.palette.text.primary} 5%, ${theme.palette.background.paper})`,
      border: (theme) => `1px solid color-mix(in srgb, ${theme.palette.text.primary} 20%, transparent)`,
      color: "text.primary",
      borderRadius: 0.375,
      boxShadow: (theme) => `0 1px 0 color-mix(in srgb, ${theme.palette.divider} 40%, transparent)`,
      px: 0.5,
      minWidth: "1.5em",
      textAlign: "center",
      ...props.sx,
    }}
  >
    {children}
  </Typography>
);

export const DemoParagraph = ({ children, ...props }: TypographyProps) => (
  <Typography variant="body2" color="text.secondary" {...props}>
    {children}
  </Typography>
);

export const Code = ({
  children,
  dark,
  sx,
  ...props
}: { children: React.ReactNode } & TypographyProps & { dark?: boolean }) => {
  const admonitionTones = useContext(AdmonitionInlineCodeStyleContext);

  const commonSx = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "90%",
    borderRadius: 1,
    py: 0.25,
    px: 0.5,
  };

  const defaultSx = admonitionTones
    ? {
        ...commonSx,
        color: admonitionTones.bodyText,
        backgroundColor: `color-mix(in srgb, ${admonitionTones.mixSource} 5%, transparent)`,
        border: `1px solid color-mix(in srgb, ${admonitionTones.mixSource} 32%, transparent)`,
        "@media screen and (min-resolution: 2dppx)": {
          border: `0.5px solid color-mix(in srgb, ${admonitionTones.mixSource} 38%, transparent)`,
        },
      }
    : {
        ...commonSx,
        backgroundColor: (theme: Theme) => `color-mix(in srgb, ${theme.palette.text.secondary} 5%, transparent)`,
        color: (theme: Theme) => `color-mix(in srgb, ${theme.palette.text.primary} ${dark ? "10%" : "90%"}, white)`,
        border: (theme: Theme) =>
          `1px solid color-mix(in srgb, ${theme.palette.divider} ${dark ? "15%" : "50%"}, transparent)`,
        "@media screen and (min-resolution: 2dppx)": {
          border: (theme: Theme) =>
            `0.5px solid color-mix(in srgb, ${theme.palette.divider} ${dark ? "25%" : "75%"}, transparent)`,
        },
      };

  return (
    <Typography
      component="span"
      variant="body2"
      data-inline-code
      {...props}
      sx={[defaultSx, sx ?? false] as SxProps<Theme>}
    >
      {children}
    </Typography>
  );
};
