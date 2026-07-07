import { StateBlock } from "@/components/ui";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-4 py-8">
      <div className="w-full max-w-lg">
        <StateBlock
          description="DekatLokal sedang memeriksa token opaque dari hasil Digital Checkup."
          kind="loading"
          title="Menghubungkan hasil checkup"
        />
      </div>
    </main>
  );
}
