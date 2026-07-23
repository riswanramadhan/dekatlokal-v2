"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

export function AuthConnectivityNotice() {
  const online = useSyncExternalStore(
    subscribeToConnection,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  return (
    <div
      aria-live="polite"
      className="auth-connectivity"
      hidden={online}
      role="status"
    >
      <WifiOff aria-hidden="true" />
      <div>
        <strong>Koneksi internet terputus</strong>
        <p>Periksa jaringan agar proses masuk dapat dilanjutkan dengan lancar.</p>
      </div>
    </div>
  );
}
