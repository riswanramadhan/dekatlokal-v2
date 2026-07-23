"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

type AuthPendingButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function AuthPendingButton({
  children,
  className,
  pendingLabel,
  variant = "primary",
}: AuthPendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      className={className}
      disabled={pending}
      type="submit"
      variant={variant}
    >
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="auth-submit-spinner" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
