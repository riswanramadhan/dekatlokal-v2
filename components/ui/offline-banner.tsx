"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner({ forceOffline = false }: { forceOffline?: boolean }) {
  const [isOffline, setIsOffline] = useState(forceOffline);

  useEffect(() => {
    const updateStatus = () => setIsOffline(forceOffline || !navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [forceOffline]);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="mx-auto mb-4 flex max-w-3xl items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm leading-6 text-text-primary">
      <WifiOff
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0 text-warning"
      />
      <p>
        Koneksi sedang tidak stabil. Draft dan status penting tetap ditampilkan
        dari data terakhir yang tersimpan.
      </p>
    </div>
  );
}
