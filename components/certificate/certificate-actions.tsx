"use client";

import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function CertificateActions() {
  const hydrated = useHydrated();
  const [shareState, setShareState] = useState("Siap dibagikan");
  const [downloadState, setDownloadState] = useState("PDF mock siap");

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-border-default bg-white p-4">
        <Button
          className="w-full"
          disabled={!hydrated}
          onClick={() => setShareState("Tautan berbagi mock sudah disiapkan")}
          variant="secondary"
        >
          <Share2 aria-hidden="true" className="h-5 w-5" />
          Bagikan
        </Button>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{shareState}</p>
      </div>
      <div className="rounded-2xl border border-border-default bg-white p-4">
        <Button
          className="w-full"
          disabled={!hydrated}
          onClick={() => setDownloadState("Unduhan demo dicatat. PDF produksi menyusul.")}
          variant="secondary"
        >
          <Download aria-hidden="true" className="h-5 w-5" />
          Unduh
        </Button>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {downloadState}
        </p>
      </div>
    </div>
  );
}
