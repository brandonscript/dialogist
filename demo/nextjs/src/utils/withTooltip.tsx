import { Box } from "@mui/material";
import Tooltip, { type TooltipProps } from "@mui/material/Tooltip";
import { type ComponentPropsWithRef, type ComponentRef, type ElementType, forwardRef } from "react";
import { isFragment, isValidElementType } from "react-is";

/**
 * Wraps a component with a tooltip.
 * Prefers `title` by default, and switches to `disabledTitle` when the wrapped component receives `disabled={true}`.
 * If the component is disabled and no `disabledTitle` is provided, the tooltip is hidden.
 */
type WithTooltipOptions<Props> = Props & {
  tooltip?: React.ReactNode;
  disabledTooltip?: React.ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "title">;
};

type MaybeDisabled = { disabled?: boolean };

export const withTooltip = <T extends ElementType>(Component: T) => {
  if (!Component) {
    throw new Error("withTooltip: a component is required");
  }

  if (!isValidElementType(Component)) {
    throw new Error("withTooltip: component is not a valid React component");
  }

  if (isFragment(Component)) {
    throw new Error("withTooltip: component cannot be a React fragment");
  }

  type Props = ComponentPropsWithRef<T>;
  type Ref = ComponentRef<T>;

  const WithTooltipComponent = forwardRef<Ref, WithTooltipOptions<Props>>(
    ({ tooltip, disabledTooltip, tooltipProps, ...props }, ref) => {
      const isDisabled =
        typeof props === "object" && props !== null && "disabled" in props
          ? Boolean((props as MaybeDisabled).disabled)
          : false;

      const tooltipTitle = isDisabled ? disabledTooltip : tooltip;
      const shouldShowTooltip =
        typeof tooltipTitle === "string"
          ? tooltipTitle.trim().length > 0
          : tooltipTitle !== undefined && tooltipTitle !== null;

      const WrappedComponent = Component as ElementType;
      const child = <WrappedComponent ref={ref} {...props} />;

      if (!shouldShowTooltip) {
        return child;
      }

      if (isDisabled) {
        return (
          <Tooltip {...tooltipProps} title={tooltipTitle}>
            <Box display={props.display || props?.sx?.display || "inline-flex"}>{child}</Box>
          </Tooltip>
        );
      }

      return (
        <Tooltip {...tooltipProps} title={tooltipTitle}>
          {child}
        </Tooltip>
      );
    },
  );

  const componentName =
    typeof Component === "string" ? Component : Component.displayName || Component.name || "Component";

  WithTooltipComponent.displayName = `WithTooltip(${componentName})`;

  return WithTooltipComponent;
};
