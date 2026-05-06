"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground border-[1.5px] border-primary hover:brightness-110 active:brightness-90 shadow-[0_0_24px_rgba(197,255,74,0.15)]",
  secondary:
    "bg-muted text-foreground border-[1.5px] border-transparent hover:bg-card-hover",
  ghost: "text-foreground hover:bg-muted border-[1.5px] border-transparent",
  outline:
    "bg-transparent text-foreground border-[1.5px] border-[rgba(61,61,61,0.8)] hover:bg-muted hover:border-[rgba(61,61,61,1)]",
  destructive:
    "bg-destructive text-destructive-foreground border-[1.5px] border-destructive hover:brightness-110",
} as const;

const sizeStyles = {
  sm: "h-7 px-3 text-[11px] tracking-[0.12em] gap-1.5",
  default: "h-9 px-4 text-[11px] tracking-[0.18em] gap-2",
  lg: "h-11 px-6 text-xs tracking-[0.2em] gap-2.5",
  icon: "h-10 w-10 p-0",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  as?: React.ElementType;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary" as ButtonVariant,
      size = "default" as ButtonSize,
      className,
      children,
      disabled,
      loading = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? props.as || "span" : "button";
    const isDisabled = disabled || loading;
    const variantClass = variantStyles[variant];
    const sizeClass = sizeStyles[size];

    if (asChild) {
      return (
        <Comp
          className={cn(
            "inline-flex items-center justify-center font-body font-semibold uppercase rounded-none",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "select-none cursor-pointer",
            variantClass,
            sizeClass,
            size === "icon" && "shrink-0",
            className,
          )}
          {...props}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-body font-semibold uppercase rounded-none",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "select-none cursor-pointer",
          // Disabled state
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant
          variantClass,
          // Size
          sizeClass,
          // When used as icon-only
          size === "icon" && "shrink-0",
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, variantStyles, sizeStyles };
