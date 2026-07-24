export default function SupportedBySection() {
  return (
    <section
      className="mx-auto grid max-w-7xl gap-6 border-b border-neutral-200 py-10 md:grid-cols-[minmax(10rem,0.34fr)_minmax(0,1fr)] md:items-start md:gap-10 md:py-12 lg:gap-16"
      aria-labelledby="tentang-dekatlokal-title"
    >
      <p className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary md:text-sm">
        <span className="h-1.5 w-5 rounded-full bg-primary" aria-hidden="true" />
        <span>Tentang DekatLokal</span>
      </p>
      <div className="relative">
        <span
          className="pointer-events-none absolute -top-9 left-0 select-none text-5xl font-semibold leading-none tracking-[-0.04em] text-neutral-950/[0.045] md:-top-12 md:text-7xl"
          aria-hidden="true"
        >
          Tentang
        </span>
        <h2
          id="tentang-dekatlokal-title"
          className="relative max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.025em] text-neutral-950 md:text-3xl lg:text-[2.55rem]"
        >
          DekatLokal membantu bisnis lokal bertumbuh dengan langkah{" "}
          <span className="text-primary">digital</span> yang lebih jelas.
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-600 md:text-[0.95rem] md:leading-7">
          Kami menghubungkan kebutuhan nyata di lapangan dengan website, sistem digital, dan
          pendampingan yang relevan, agar usaha tidak hanya terlihat online, tetapi juga lebih siap
          ditemukan, dipercaya, dan berkembang bersama komunitasnya.
        </p>
      </div>
    </section>
  );
}
