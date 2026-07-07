export default function MulaiLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Memeriksa hasil Digital Checkup"
      className="min-h-screen bg-surface-page px-4 py-5"
    >
      <div className="mx-auto max-w-[560px] animate-pulse space-y-6">
        <div className="h-10 w-36 rounded-xl bg-brand-primary-soft" />
        <div className="h-3 rounded-full bg-brand-primary-soft" />
        <div className="h-16 w-16 rounded-2xl bg-brand-primary-soft" />
        <div className="h-10 w-4/5 rounded-xl bg-surface-subtle" />
        <div className="h-24 rounded-2xl bg-surface-subtle" />
      </div>
    </main>
  );
}
