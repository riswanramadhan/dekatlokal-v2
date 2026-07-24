"use client";

import { usePathname } from "next/navigation";

const INTERNAL_PATH_PREFIXES = ["/admin", "/login", "/scoring-simulation"];

export default function PublicPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternalPage = INTERNAL_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isInternalPage) {
    return <>{children}</>;
  }

  return (
    <div key={pathname} className="public-page-transition">
      {children}
    </div>
  );
}
