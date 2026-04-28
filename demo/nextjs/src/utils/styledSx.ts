import { type SxProps, styled, type Theme } from "@mui/material";
import type { MuiStyledOptions } from "@mui/system";

/**
 * A wrapper around MUI's styled() that automatically applies theme.unstable_sx
 * This allows you to use sx-style syntax directly in styled components
 *
 * @example
 * // Instead of:
 * const MyComponent = styled(Box)(({ theme }) => theme.unstable_sx({
 *   p: 2,
 *   bgcolor: 'primary.main',
 *   borderRadius: 1,
 * }));
 *
 * // You can write:
 * const MyComponent = styledSx(Box)({
 *   p: 2,
 *   bgcolor: 'primary.main',
 *   borderRadius: 1,
 * });
 *
 * // Works with all sx syntax:
 * const ResponsiveComponent = styledSx(Box)({
 *   p: { xs: 1, md: 2 },
 *   display: 'flex',
 *   bgcolor: 'background.paper',
 *   borderColor: 'divider',
 * });
 */
interface StyledSxFn {
  <TComponent extends React.ComponentType<any>>(
    component: TComponent,
    options?: MuiStyledOptions,
  ): (styles: SxProps<Theme>) => TComponent;
  <TComponent extends React.ComponentType<any>>(
    component: TComponent,
    options?: MuiStyledOptions,
  ): (styles: (props: { theme: Theme }) => SxProps<Theme>) => TComponent;
}

export const styledSx: StyledSxFn =
  <TComponent extends React.ComponentType<any>>(component: TComponent, options?: MuiStyledOptions) =>
  (styles: SxProps<Theme> | ((props: { theme: Theme }) => SxProps<Theme>)) =>
    styled(
      component,
      options,
    )((props: { theme: Theme }) => {
      const { theme } = props;
      const sxResult = typeof styles === "function" ? styles(props as any) : styles;
      return theme.unstable_sx(sxResult);
    });

export default styledSx;
