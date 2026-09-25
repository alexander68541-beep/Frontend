"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "default" | "accent" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  default: "btn",
  accent: "btn btn-accent",
  ghost: "btn btn-ghost",
};

export function Button({
  variant = "default",
  block,
  loading,
  disabled,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      className={`${variantClass[variant]} ${block ? "btn-block" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
