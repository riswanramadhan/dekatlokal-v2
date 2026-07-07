"use client";

import { Button } from "@/components/ui";
import { StateBlock } from "@/components/ui/state-block";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <StateBlock
        description="Ada bagian yang belum dapat dimuat. Coba ulang tanpa kehilangan progres mock."
        kind="error"
        title="Ruang Tumbuh belum siap"
      />
      <Button className="w-full md:w-auto" onClick={reset}>
        Coba lagi
      </Button>
    </div>
  );
}
