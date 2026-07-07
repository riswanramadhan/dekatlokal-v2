import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  LoaderCircle,
  Lock,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type StateKind =
  | "loading"
  | "empty"
  | "error"
  | "offline"
  | "retry"
  | "locked"
  | "success"
  | "sync";

const stateIcon = {
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertCircle,
  offline: WifiOff,
  retry: RefreshCw,
  locked: Lock,
  success: CheckCircle2,
  sync: Clock3,
};

export function StateBlock({
  kind,
  title,
  description,
  action,
  className,
}: {
  kind: StateKind;
  title: string;
  description: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  const Icon = stateIcon[kind];

  return (
    <section
      className={cn(
        "premium-card overflow-hidden rounded-[var(--radius-xl)] p-6 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-primary to-accent-purple text-white shadow-[var(--shadow-blue)]">
        <Icon
          aria-hidden="true"
          className={cn("h-6 w-6", kind === "loading" && "animate-spin")}
        />
      </div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-base leading-7 text-text-secondary">
        {description}
      </p>
      {action ? (
        <ButtonLink className="mt-5 w-full" href={action.href}>
          {action.label}
        </ButtonLink>
      ) : null}
    </section>
  );
}

export function StateGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
